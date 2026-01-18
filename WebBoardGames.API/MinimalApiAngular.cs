using Microsoft.Extensions.FileProviders;

namespace WebBoardGames.API;

public static class MinimalApiAngular
{
    public static void AddMinimalApiAngular(this WebApplicationBuilder builder, string angularDevServerUrl)
    {
        if (!builder.Environment.IsDevelopment()) { return; }

        builder.Services.AddReverseProxy()
            .LoadFromMemory(
            [
                new Yarp.ReverseProxy.Configuration.RouteConfig
                {
                    RouteId = "angular-spa",
                    Match = new Yarp.ReverseProxy.Configuration.RouteMatch
                    {
                        Path = "{**catch-all}"
                    },
                    ClusterId = "angular-spa-cluster"
                }
            ],
            [
                new Yarp.ReverseProxy.Configuration.ClusterConfig
                {
                    ClusterId = "angular-spa-cluster",
                    Destinations = new Dictionary<string, Yarp.ReverseProxy.Configuration.DestinationConfig>
                    {
                        { "angular", new Yarp.ReverseProxy.Configuration.DestinationConfig { Address = angularDevServerUrl } }
                    }
                }
            ]);
    }

    public static WebApplication UseMinimalApiAngular(this WebApplication app, string angularDistPath)
    {
        if (app.Environment.IsDevelopment())
        {
            UseAngularDevProxy(app);
        }
        else
        {
            UseAngularStaticFiles(app, angularDistPath);
        }
        return app;
    }

    private static void UseAngularDevProxy(WebApplication app)
    {
        app.MapWhen(
            ctx => !ctx.Request.Path.StartsWithSegments("/api") && !ctx.Request.Path.StartsWithSegments("/swagger"),
            spa =>
            {
                spa.UseRouting();
                spa.UseEndpoints(endpoints =>
                {
                    endpoints.MapReverseProxy(proxyPipeline =>
                    {
                        proxyPipeline.Use((context, next) =>
                        {
                            context.Request.PathBase = "";
                            return next();
                        });
                    });
                });
            }
        );
    }

    private static void UseAngularStaticFiles(WebApplication app, string angularDistPath)
    {
        app.UseDefaultFiles();
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(angularDistPath),
            RequestPath = ""
        });

        // Custom middleware: recursively serve index.html from parent directories
        app.Use(async (context, next) =>
        {
            if (context.Request.Method == "GET" &&
                !context.Request.Path.StartsWithSegments("/api") &&
                !context.Request.Path.StartsWithSegments("/swagger"))
            {
                var reqPath = context.Request.Path.Value?.TrimEnd('/') ?? "";
                var segments = reqPath.TrimStart('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
                for (int i = segments.Length; i >= 0; i--)
                {
                    var tryPath = string.Join('/', segments.Take(i));
                    var indexPath = string.IsNullOrEmpty(tryPath)
                        ? Path.Combine(angularDistPath, "index.html")
                        : Path.Combine(angularDistPath, tryPath, "index.html");
                    if (File.Exists(indexPath))
                    {
                        context.Response.ContentType = "text/html";
                        await context.Response.SendFileAsync(indexPath);
                        return;
                    }
                }
            }
            await next();
        });

        // Fallback to root index.html for SPA
        app.MapFallbackToFile("index.html");
    }
}
