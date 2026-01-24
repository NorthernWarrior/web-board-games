using CronExpressionDescriptor;
using Humanizer;
using Microsoft.Extensions.Logging;
using Quartz;
using Quartz.Impl.Matchers;
using System.Collections.ObjectModel;
using WebBoardGames.Domain.Services;

namespace WebBoardGames.Application.Services;

public sealed class QuartzJobSchedulerService(
    ILogger<QuartzJobSchedulerService> _logger,
    ISchedulerFactory _schedulerFactory
) : IJobSchedulerService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var scheduler = await _schedulerFactory.GetScheduler(cancellationToken);
        await scheduler.Start(cancellationToken);
    }

    public async Task ScheduleJobAsync<TJob>(JobScheduleSettings scheduleSettings, CancellationToken cancellationToken) where TJob : IJob
    {
        if (_logger.IsEnabled(LogLevel.Information)) { _logger.LogInformation("Scheduling job {JobName}", typeof(TJob).Name); }

        var jobDetail = JobBuilder.Create<TJob>()
            .WithIdentity($"{typeof(TJob).Name}")
            .DisallowConcurrentExecution(scheduleSettings.DisallowConcurrentExecution)
            .Build();

        var scheduler = await _schedulerFactory.GetScheduler(cancellationToken);

        var triggers = scheduleSettings switch
        {
            JobCronScheduleSettings cron => TriggersFromCronSettings(jobDetail.Key.Name, cron),
            _ => throw new NotSupportedException($"JobScheduleSettings type {scheduleSettings.GetType().Name} is not supported."),
        };

        await scheduler.ScheduleJob(jobDetail, triggers, replace: true, cancellationToken);
    }

    public async Task<ReadOnlyCollection<JobInfo>> GetScheduledJobsAsync(CancellationToken cancellationToken)
    {
        var scheduler = await _schedulerFactory.GetScheduler(cancellationToken);
        var keys = await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup(), cancellationToken);
        var result = new List<JobInfo>(keys.Count);
        foreach (var key in keys)
        {
            var triggers = await scheduler.GetTriggersOfJob(key, cancellationToken);
            result.Add(new(
                key.Group,
                key.Name,
                triggers.Select(
                    x => new JobTriggerInfo(
                        x.Key.Group,
                        x.Key.Name,
                        x.GetNextFireTimeUtc(),
                        x.GetPreviousFireTimeUtc(),
                        _GetTriggerInfo(x)
                    ))
                    .ToList()
                    .AsReadOnly()
                )
            );
        }
        return result.AsReadOnly();
    }

    public async Task<ReadOnlyCollection<string>> GetRunningJobsAsync(CancellationToken cancellationToken)
    {
        var scheduler = await _schedulerFactory.GetScheduler(cancellationToken);
        var jobs = await scheduler.GetCurrentlyExecutingJobs(cancellationToken);
        var result = jobs.Select(x => $"{x.JobDetail.Key}:Running for {x.JobRunTime.Humanize()}:Triggered by {x.Trigger.Key}").ToList().AsReadOnly();
        return result;
    }

    private static List<ITrigger> TriggersFromCronSettings(string jobName, JobCronScheduleSettings cron)
    {
        var result = new List<ITrigger>(2);

        var builder = TriggerBuilder.Create()
            .WithIdentity($"{jobName}-trigger-cron")
            .WithCronSchedule(cron.CronExpression);
        result.Add(builder.Build());
        if (cron.StartOnceImmediate)
        {
            var immediateBuilder = TriggerBuilder.Create()
                .WithIdentity($"{jobName}-trigger-immediate")
                .StartNow();
            result.Add(immediateBuilder.Build());
        }
        return result;
    }

    private static string _GetTriggerInfo(ITrigger x) => x switch
    {
        ICronTrigger cronTrigger => $"Cron Expression: {ExpressionDescriptor.GetDescription(cronTrigger.CronExpressionString)} ({cronTrigger.CronExpressionString})",
        ISimpleTrigger simpleTrigger => $"Simple Trigger: Repeat Count = {simpleTrigger.RepeatCount}, Repeat Interval = {simpleTrigger.RepeatInterval}, Start At = {simpleTrigger.StartTimeUtc}",
        _ => string.Empty,
    };
}
