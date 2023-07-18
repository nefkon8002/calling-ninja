package mx.calling.ninja.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
        .allowCredentials(true)
        .allowedMethods("*")
        .allowedOrigins("http://localhost:4200", "http://localhost:8080", "http://callingninja-ui-web:8080", "http://54.87.95.213:8080")
        .allowedHeaders("*")
        .maxAge(3600);
    }

}
