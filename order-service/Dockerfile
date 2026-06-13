FROM gradle:8.5-jdk17-alpine AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon -q
COPY src src
RUN gradle bootJar --no-daemon -x test

FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser
EXPOSE 8083
ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]
