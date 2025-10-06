---
title: "Maven Build Tool: From Basics to Production"
description: "Master Maven for Java projects. Learn dependency management, build lifecycle, plugins, multi-module projects, and production best practices."
publishDate: 2025-10-06
author: "Prashant Chaturvedi"
tags: ["Maven", "Java", "Build Tool", "Dependency Management", "CI/CD", "DevOps"]
readTime: "25 min read"
difficulty: "intermediate"
estimatedTime: "50 minutes"
---

# Maven Build Tool: From Basics to Production

Maven manages Java project builds, dependencies, and documentation. Write a `pom.xml` file, run `mvn clean install`, and Maven handles compilation, testing, packaging, and deployment.

## Why Maven

**Before Maven:**
```bash
# Download JARs manually
wget https://repo1.maven.org/maven2/junit/junit/4.13.2/junit-4.13.2.jar
wget https://repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar

# Compile with classpath hell
javac -cp ".:lib/junit-4.13.2.jar:lib/hamcrest-core-1.3.jar" src/**/*.java -d target/classes

# Package manually
jar cf myapp.jar -C target/classes .
```

**With Maven:**
```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```

```bash
mvn clean install
```

Maven downloads dependencies, compiles code, runs tests, packages JAR. Transitive dependencies included automatically.

## Installation

**Linux/macOS:**
```bash
# Download
wget https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz

# Extract
tar xzf apache-maven-3.9.6-bin.tar.gz
sudo mv apache-maven-3.9.6 /opt/maven

# Add to PATH
echo 'export M2_HOME=/opt/maven' >> ~/.bashrc
echo 'export PATH=$M2_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Verify:**
```bash
mvn -version
```

**Output:**
```
Apache Maven 3.9.6
Maven home: /opt/maven
Java version: 17.0.8
```

## Project Structure

Maven enforces standard directory layout:

```
my-app/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/              # Application code
    │   │   └── com/
    │   │       └── example/
    │   │           └── App.java
    │   └── resources/         # Configuration files
    │       └── application.properties
    └── test/
        ├── java/              # Test code
        │   └── com/
        │       └── example/
        │           └── AppTest.java
        └── resources/         # Test resources
            └── test.properties
```

Convention over configuration. Maven knows where to find source files without explicit configuration.

## Creating a Project

```bash
mvn archetype:generate \
  -DgroupId=com.example \
  -DartifactId=my-app \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DarchetypeVersion=1.4 \
  -DinteractiveMode=false
```

**Parameters:**
- `groupId`: Organization domain reversed (com.example, org.apache)
- `artifactId`: Project name (my-app)
- `archetypeArtifactId`: Project template (quickstart, webapp, etc.)

Creates project with `pom.xml` and basic structure.

## The POM File

`pom.xml` (Project Object Model) defines project configuration:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>My Application</name>
    <description>A sample Maven project</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
            </plugin>
        </plugins>
    </build>
</project>
```

### Coordinates

Maven identifies artifacts with GAV coordinates:

```xml
<groupId>com.example</groupId>
<artifactId>my-app</artifactId>
<version>1.0-SNAPSHOT</version>
```

- **groupId**: Package namespace
- **artifactId**: Project name
- **version**: Release version or SNAPSHOT (development)

Together: `com.example:my-app:1.0-SNAPSHOT`

### Packaging

```xml
<packaging>jar</packaging>
```

Options: `jar`, `war`, `ear`, `pom`, `maven-plugin`

Determines output artifact type and build lifecycle.

## Dependencies

### Adding Dependencies

Find artifacts on [Maven Central](https://search.maven.org/):

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.2.0</version>
    </dependency>

    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.10.1</version>
    </dependency>

    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.1</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

Run `mvn install` to download dependencies to `~/.m2/repository`.

### Dependency Scopes

```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>2.0.9</version>
    <scope>compile</scope>  <!-- Default -->
</dependency>
```

**Scopes:**

**compile**: Available in all classpaths (compile, test, runtime). Default scope.

**provided**: Needed for compilation but provided by runtime (servlet-api, JPA API). Not packaged.

**runtime**: Not needed for compilation, only runtime (JDBC drivers).

**test**: Only for test compilation and execution (JUnit, Mockito).

**system**: Like provided but JAR location specified manually. Avoid this.

**import**: Only in `<dependencyManagement>`. Imports dependency management from another POM.

### Transitive Dependencies

Maven resolves dependencies of dependencies automatically.

Add Spring Boot starter:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>3.2.0</version>
</dependency>
```

Maven pulls:
- spring-boot-starter-web
- spring-boot-starter
- spring-boot
- spring-core
- spring-web
- spring-webmvc
- jackson-databind
- tomcat-embed-core
- ... and more

View dependency tree:
```bash
mvn dependency:tree
```

**Output:**
```
[INFO] com.example:my-app:jar:1.0-SNAPSHOT
[INFO] \- org.springframework.boot:spring-boot-starter-web:jar:3.2.0:compile
[INFO]    +- org.springframework.boot:spring-boot-starter:jar:3.2.0:compile
[INFO]    |  +- org.springframework.boot:spring-boot:jar:3.2.0:compile
[INFO]    |  \- org.springframework:spring-core:jar:6.1.1:compile
[INFO]    +- org.springframework:spring-web:jar:6.1.1:compile
[INFO]    \- org.springframework:spring-webmvc:jar:6.1.1:compile
```

### Dependency Management

Centralize versions in parent POM:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.2.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- No version needed - inherited from dependencyManagement -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

Benefits:
- Single source of truth for versions
- Consistent versions across modules
- Easier upgrades

### Excluding Transitive Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>3.2.0</version>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- Use Jetty instead of Tomcat -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
    <version>3.2.0</version>
</dependency>
```

Exclude unwanted transitive dependencies and add replacements.

## Build Lifecycle

Maven has three built-in lifecycles: **default**, **clean**, **site**.

### Default Lifecycle Phases

```bash
mvn clean install
```

Executes phases in order:

1. **validate**: Verify project correctness
2. **compile**: Compile source code
3. **test**: Run unit tests
4. **package**: Package compiled code (JAR/WAR)
5. **verify**: Run integration tests
6. **install**: Install to local repository
7. **deploy**: Deploy to remote repository

Running a phase executes all previous phases. `mvn install` runs validate → compile → test → package → verify → install.

### Clean Lifecycle

```bash
mvn clean
```

Deletes `target/` directory, removing compiled classes and artifacts.

### Common Commands

```bash
mvn clean                    # Delete target/
mvn compile                  # Compile main code
mvn test                     # Compile and run tests
mvn package                  # Create JAR/WAR
mvn install                  # Install to local repo
mvn clean install            # Clean, then install
mvn clean install -DskipTests  # Skip running tests
mvn clean install -Dmaven.test.skip=true  # Skip compiling and running tests
```

## Plugins

Plugins execute tasks during build lifecycle.

### Compiler Plugin

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>17</source>
                <target>17</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>
    </plugins>
</build>
```

Compiles Java source to bytecode.

### Surefire Plugin (Unit Tests)

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.2.2</version>
    <configuration>
        <includes>
            <include>**/*Test.java</include>
            <include>**/*Tests.java</include>
        </includes>
    </configuration>
</plugin>
```

Runs tests during `test` phase. Fails build if tests fail.

### Failsafe Plugin (Integration Tests)

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.2.2</version>
    <executions>
        <execution>
            <goals>
                <goal>integration-test</goal>
                <goal>verify</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

Runs integration tests (`*IT.java`) during `verify` phase.

### JAR Plugin

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <version>3.3.0</version>
    <configuration>
        <archive>
            <manifest>
                <mainClass>com.example.App</mainClass>
                <addClasspath>true</addClasspath>
            </manifest>
        </archive>
    </configuration>
</plugin>
```

Creates JAR with main class manifest entry.

### Shade Plugin (Fat JAR)

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.5.1</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
                <transformers>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                        <mainClass>com.example.App</mainClass>
                    </transformer>
                </transformers>
            </configuration>
        </execution>
    </executions>
</plugin>
```

Creates executable JAR with all dependencies bundled.

Run: `java -jar target/my-app-1.0-SNAPSHOT.jar`

## Properties

Define reusable values:

```xml
<properties>
    <java.version>17</java.version>
    <spring.boot.version>3.2.0</spring.boot.version>
    <junit.version>5.10.1</junit.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>${spring.boot.version}</version>
    </dependency>

    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

Reference with `${property.name}`.

**System properties:**
- `${java.version}`: Java version
- `${user.home}`: User home directory
- `${project.version}`: Project version from POM
- `${project.basedir}`: Project root directory

## Essential Maven Commands

Commands you'll use daily during development:

### Build Commands

```bash
# Clean build from scratch
mvn clean install

# Quick compile without tests
mvn clean compile

# Package without running tests
mvn clean package -DskipTests

# Skip test compilation and execution (faster)
mvn clean install -Dmaven.test.skip=true

# Run only tests (no compilation)
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest

# Run specific test method
mvn test -Dtest=UserServiceTest#testCreateUser

# Package and run Spring Boot app
mvn spring-boot:run
```

### Dependency Commands

```bash
# Download dependencies without building
mvn dependency:resolve

# Download source JARs (for IDE)
mvn dependency:sources

# Download Javadoc JARs
mvn dependency:resolve -Dclassifier=javadoc

# Show dependency tree
mvn dependency:tree

# Show dependency tree for specific artifact
mvn dependency:tree -Dincludes=org.springframework:spring-core

# Analyze dependencies (find unused/undeclared)
mvn dependency:analyze

# Copy dependencies to target/dependency
mvn dependency:copy-dependencies

# Purge local repository cache for project
mvn dependency:purge-local-repository

# Update all snapshots
mvn clean install -U

# Download dependencies offline (use cached only)
mvn clean install -o
```

### Performance Commands

```bash
# Parallel builds (4 threads)
mvn clean install -T 4

# Parallel builds (1 thread per CPU core)
mvn clean install -T 1C

# Build only changed modules (incremental)
mvn clean install -pl :module-name -am

# Build specific module and its dependencies
mvn clean install -pl module-name -am

# Build module without dependencies
mvn clean install -pl module-name

# Resume build from failed module
mvn clean install -rf :failed-module-name
```

### Documentation Commands

```bash
# Generate project site with reports
mvn site

# Generate Javadoc
mvn javadoc:javadoc

# Open Javadoc in browser
mvn javadoc:javadoc && open target/site/apidocs/index.html

# Generate test coverage report (with JaCoCo)
mvn clean test jacoco:report

# Generate dependency report
mvn project-info-reports:dependencies
```

### Debug and Troubleshooting

```bash
# Verbose output (debug mode)
mvn clean install -X

# Show version and diagnostic info
mvn -version

# Validate POM without building
mvn validate

# Display effective POM (with inheritance resolved)
mvn help:effective-pom

# Display effective settings
mvn help:effective-settings

# Describe a plugin
mvn help:describe -Dplugin=compiler

# Describe a plugin goal
mvn help:describe -Dplugin=compiler -Dgoal=compile -Ddetail

# List active profiles
mvn help:active-profiles

# Show all available plugins
mvn help:describe -Dplugin=help
```

### Cleanup Commands

```bash
# Clean target directory
mvn clean

# Remove all non-snapshot artifacts from local repo
mvn dependency:purge-local-repository

# Clean and reinstall everything
mvn clean install -U

# Force re-download of snapshots
mvn clean install -U
```

### Multi-Module Commands

```bash
# Build all modules
mvn clean install

# Build from root, specific module only
mvn clean install -pl api

# Build module and dependencies
mvn clean install -pl api -am

# Build module and dependents
mvn clean install -pl common -amd

# Build multiple modules
mvn clean install -pl api,web,common

# Skip module during build
mvn clean install -pl '!integration-tests'
```

### Release Commands

```bash
# Prepare release (update versions, tag)
mvn release:prepare

# Perform release (build and deploy)
mvn release:perform

# Rollback failed release
mvn release:rollback

# Clean release preparation
mvn release:clean

# Set new version
mvn versions:set -DnewVersion=2.0.0

# Commit version change
mvn versions:commit

# Revert version change
mvn versions:revert
```

### Quick Reference

**Daily Development:**
```bash
mvn clean install -DskipTests    # Fast build, skip tests
mvn test                         # Run tests only
mvn spring-boot:run              # Run Spring Boot app
mvn dependency:tree              # Check dependencies
```

**Before Commit:**
```bash
mvn clean verify                 # Full build with tests
mvn dependency:analyze           # Check for issues
```

**Performance Builds:**
```bash
mvn clean install -T 1C -DskipTests    # Parallel, no tests
mvn clean install -o -DskipTests       # Offline, no tests
```

**Troubleshooting:**
```bash
mvn clean install -U -X          # Force update, debug output
mvn dependency:purge-local-repository  # Clear cache
```

## Profiles

Profiles customize builds for different environments:

```xml
<profiles>
    <profile>
        <id>dev</id>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
        <properties>
            <env>development</env>
            <db.url>jdbc:mysql://localhost:3306/dev_db</db.url>
        </properties>
    </profile>

    <profile>
        <id>prod</id>
        <properties>
            <env>production</env>
            <db.url>jdbc:mysql://prod-server:3306/prod_db</db.url>
        </properties>
        <build>
            <plugins>
                <plugin>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <configuration>
                        <debug>false</debug>
                        <optimize>true</optimize>
                    </configuration>
                </plugin>
            </plugins>
        </build>
    </profile>
</profiles>
```

Activate profile:
```bash
mvn clean install -Pprod
```

Multiple profiles:
```bash
mvn clean install -Pdev,integration-tests
```

## Multi-Module Projects

Organize related projects:

```
parent/
├── pom.xml              # Parent POM
├── common/
│   ├── pom.xml
│   └── src/
├── api/
│   ├── pom.xml
│   └── src/
└── web/
    ├── pom.xml
    └── src/
```

### Parent POM

```xml
<project>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>parent</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>common</module>
        <module>api</module>
        <module>web</module>
    </modules>

    <properties>
        <java.version>17</java.version>
        <spring.boot.version>3.2.0</spring.boot.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

### Child POM

```xml
<project>
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.example</groupId>
        <artifactId>parent</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>api</artifactId>

    <dependencies>
        <!-- Reference sibling module -->
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>common</artifactId>
            <version>${project.version}</version>
        </dependency>

        <!-- Version inherited from parent -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>
```

Build all modules:
```bash
cd parent
mvn clean install
```

Build single module:
```bash
cd parent/api
mvn clean install
```

## Repositories

Maven downloads dependencies from repositories.

### Central Repository

Default repository at `https://repo.maven.apache.org/maven2/`

No configuration needed.

### Custom Repositories

```xml
<repositories>
    <repository>
        <id>spring-milestones</id>
        <name>Spring Milestones</name>
        <url>https://repo.spring.io/milestone</url>
    </repository>
</repositories>
```

### Deploy to Repository

```xml
<distributionManagement>
    <repository>
        <id>releases</id>
        <url>https://nexus.example.com/repository/maven-releases/</url>
    </repository>
    <snapshotRepository>
        <id>snapshots</id>
        <url>https://nexus.example.com/repository/maven-snapshots/</url>
    </snapshotRepository>
</distributionManagement>
```

Configure credentials in `~/.m2/settings.xml`:

```xml
<settings>
    <servers>
        <server>
            <id>releases</id>
            <username>admin</username>
            <password>admin123</password>
        </server>
        <server>
            <id>snapshots</id>
            <username>admin</username>
            <password>admin123</password>
        </server>
    </servers>
</settings>
```

Deploy:
```bash
mvn clean deploy
```

## Best Practices

### Version Management

Use properties for version consistency:

```xml
<properties>
    <spring.version>6.1.1</spring.version>
    <jackson.version>2.16.0</jackson.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-web</artifactId>
        <version>${spring.version}</version>
    </dependency>
</dependencies>
```

### Dependency Analysis

Find unused dependencies:
```bash
mvn dependency:analyze
```

**Output:**
```
[WARNING] Unused declared dependencies found:
[WARNING]    com.google.guava:guava:jar:32.1.3-jre:compile
[WARNING] Used undeclared dependencies found:
[WARNING]    org.slf4j:slf4j-api:jar:2.0.9:compile
```

### Lock Down Plugin Versions

Avoid build inconsistency:

```xml
<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
            </plugin>
            <plugin>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.2</version>
            </plugin>
        </plugins>
    </pluginManagement>
</build>
```

### Clean Local Repository

Remove corrupted artifacts:
```bash
rm -rf ~/.m2/repository
mvn clean install
```

Force update:
```bash
mvn clean install -U
```

### Parallel Builds

Speed up multi-module builds:
```bash
mvn clean install -T 4    # Use 4 threads
mvn clean install -T 1C   # One thread per CPU core
```

## Production Configuration

### Spring Boot Application

```xml
<project>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>my-service</artifactId>
    <version>1.0.0</version>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

Build:
```bash
mvn clean package
java -jar target/my-service-1.0.0.jar
```

### CI/CD Integration

**GitHub Actions:**
```yaml
name: Maven Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'maven'
      - name: Build with Maven
        run: mvn clean verify
```

**Jenkins:**
```groovy
pipeline {
    agent any
    tools {
        maven 'Maven 3.9.6'
        jdk 'JDK 17'
    }
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
    }
}
```

## Troubleshooting

### Dependency Conflicts

```bash
mvn dependency:tree -Dverbose
```

Shows all dependencies and conflicts. Exclude unwanted versions.

### Build Fails After Dependency Update

```bash
mvn clean install -U    # Force update
```

### Out of Memory

Increase heap size:
```bash
export MAVEN_OPTS="-Xmx2048m -XX:MaxPermSize=512m"
mvn clean install
```

### Cannot Download Dependencies

Check `~/.m2/settings.xml` for proxy configuration:

```xml
<settings>
    <proxies>
        <proxy>
            <id>company-proxy</id>
            <active>true</active>
            <protocol>http</protocol>
            <host>proxy.example.com</host>
            <port>8080</port>
        </proxy>
    </proxies>
</settings>
```

## Summary

Maven standardizes Java project builds:

- **Convention over configuration**: Standard directory layout
- **Dependency management**: Automatic transitive resolution
- **Build lifecycle**: Consistent phases (compile, test, package, install)
- **Plugins**: Extensible build tasks
- **Multi-module projects**: Organize related modules
- **Profiles**: Environment-specific builds
- **Repository integration**: Deploy artifacts to central repos

Master these concepts and you'll manage Java projects efficiently from development through production.
