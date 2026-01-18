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
        // Skip static files in Test environment or if path doesn't exist
        var fullPath = Path.IsPathRooted(angularDistPath) 
            ? angularDistPath 
            : Path.Combine(app.Environment.ContentRootPath, angularDistPath);
            
        if (!Directory.Exists(fullPath))
        {
            return;
        }
        
        app.UseDefaultFiles();
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(fullPath),
            RequestPath = ""
        });
    }
}
