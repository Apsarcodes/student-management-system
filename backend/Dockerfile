# Stage 1: Build JAR using Maven and Eclipse Temurin JDK 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy POM (build uses Maven installed in the image; no wrapper required)
COPY pom.xml ./

# Pre-fetch dependencies
RUN mvn dependency:go-offline -B

# Copy source code and package
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Lightweight runtime image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create non-root system user for security
RUN groupadd -r appgroup && useradd -r -g appgroup -s /bin/false appuser

# Copy executable jar from build stage
COPY --from=build /app/target/student-management-backend-1.0.0.jar app.jar

# Only non-secret defaults here — secrets MUST be provided at runtime
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=mysql \
    DB_URL=jdbc:mysql://mysql:3306/student_management_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true \
    DB_USERNAME=root

# DB_PASSWORD, JWT_SECRET, and CORS_ALLOWED_ORIGINS must be provided via
# docker-compose environment, .env file, or orchestrator secrets.

EXPOSE 8080

USER appuser

ENTRYPOINT ["java", "-jar", "app.jar"]
