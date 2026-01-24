using Quartz;
using System.Collections.ObjectModel;

namespace WebBoardGames.Domain.Services;

public interface IJobSchedulerService
{
    Task StartAsync(CancellationToken cancellationToken);
    Task ScheduleJobAsync<TJob>(JobScheduleSettings scheduleSettings, CancellationToken cancellationToken) where TJob : IJob;
    Task<ReadOnlyCollection<JobInfo>> GetScheduledJobsAsync(CancellationToken cancellationToken);
    Task<ReadOnlyCollection<string>> GetRunningJobsAsync(CancellationToken cancellationToken);
}

public abstract record JobScheduleSettings(
    bool DisallowConcurrentExecution = true
);

/// <param name="CronExpression">
/// A standard CRON expression which specifies when then job schould be triggererd.<br/>
/// More info about CRON expressions can be found <a href="https://www.quartz-scheduler.net/documentation/quartz-3.x/tutorial/crontriggers.html">here</a>.
/// </param>
public record JobCronScheduleSettings(
    string CronExpression,
    bool StartOnceImmediate,
    bool DisallowConcurrentExecution = true
) : JobScheduleSettings(
    DisallowConcurrentExecution
);

public record JobInfo(
    string Group,
    string Key,
    ReadOnlyCollection<JobTriggerInfo> Triggers
);
public record JobTriggerInfo(
    string Group,
    string Key,
    DateTimeOffset? NextFireTime,
    DateTimeOffset? PreviousFireTime,
    string Info
);