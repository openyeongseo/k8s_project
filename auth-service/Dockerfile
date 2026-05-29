FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
RUN apk add --no-cache curl unzip &&     curl -sL https://services.gradle.org/distributions/gradle-8.5-bin.zip -o /tmp/gradle.zip &&     unzip -q /tmp/gradle.zip -d /opt &&     ln -s /opt/gradle-8.5/bin/gradle /usr/local/bin/gradle &&     rm /tmp/gradle.zip
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
EXPOSE 8081
ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]
