# ---------- Stage 1: build and split the jar into layers ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Dependency layer: only re-runs when pom.xml changes
COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline

# Application layer
COPY src ./src
RUN mvn -B -ntp clean package -DskipTests

# Rename the jar first so the extracted jar is always called application.jar
# (this must match the ENTRYPOINT), then split it into layers.
RUN cp target/*.jar application.jar \
 && java -Djarmode=tools -jar application.jar extract --layers --destination /build/extracted


# ---------- Stage 2: minimal runtime ----------
FROM eclipse-temurin:17-jre-noble
LABEL org.opencontainers.image.source="https://github.com/Sunil-Phuyal/Care-Sync"

WORKDIR /application

# Non-root user with a fixed numeric UID/GID
RUN groupadd --system --gid 10001 app \
 && useradd --system --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app

# Least-changing layers first, so Docker reuses them between builds
COPY --from=build /build/extracted/dependencies/ ./
COPY --from=build /build/extracted/spring-boot-loader/ ./
COPY --from=build /build/extracted/snapshot-dependencies/ ./
COPY --from=build /build/extracted/application/ ./

# JVM flags are read by the JVM itself, so the entrypoint can stay exec-form
# (java runs as PID 1 and receives SIGTERM for graceful shutdown).
# Override the whole string from the host's environment variables if needed.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=60 -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError -Duser.timezone=Asia/Kathmandu"

USER 10001:10001
EXPOSE 9878

ENTRYPOINT ["java", "-jar", "application.jar"]