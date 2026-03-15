# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the application, skipping tests for faster builds
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar
COPY --from=build /app/target/*.jar app.jar

# Setup environment variables that can be overridden at runtime
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

EXPOSE ${PORT}
ENTRYPOINT ["java", "-jar", "app.jar"]
