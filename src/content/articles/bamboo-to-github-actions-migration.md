---
title: "Migrating from Bamboo to GitHub Actions: Java, Kotlin, and Spring Boot Guide"
description: "Complete guide to migrating CI/CD pipelines from Atlassian Bamboo to GitHub Actions for Maven, Gradle, Java, Kotlin, and Spring Boot applications."
publishDate: 2024-09-01
author: "Prashant Chaturvedi"
tags: ["GitHub Actions", "Bamboo", "CI/CD", "Java", "Kotlin", "Spring Boot", "Maven", "Gradle", "DevOps", "Migration"]
readTime: "30 min read"
difficulty: "intermediate"
estimatedTime: "60 minutes"
---

# Migrating from Bamboo to GitHub Actions: Java, Kotlin, and Spring Boot Guide

Moving from Atlassian Bamboo to GitHub Actions eliminates infrastructure overhead, reduces costs, and integrates CI/CD directly into your repository. This guide walks through migrating Java, Kotlin, Maven, Gradle, and Spring Boot pipelines with real-world examples.

## Why Migrate from Bamboo to GitHub Actions

**Cost and Infrastructure:**
- **Bamboo**: Requires dedicated servers, licensing costs, and manual maintenance
- **GitHub Actions**: Free for public repos, pay-as-you-go for private repos, zero infrastructure

**Integration:**
- **Bamboo**: Separate system requiring webhook configuration
- **GitHub Actions**: Native GitHub integration with automatic PR checks

**Developer Experience:**
- **Bamboo**: UI-based configuration, XML exports
- **GitHub Actions**: YAML files in your repository, version-controlled with code

**Migration Benefits:**
```
✓ Infrastructure-less CI/CD
✓ Native GitHub integration
✓ Larger ecosystem of actions
✓ Better scaling and parallelization
✓ No server maintenance
✓ Version-controlled pipelines
```

## Understanding Bamboo vs GitHub Actions

### Bamboo Concepts

**Bamboo Structure:**
```
Project
  └── Plan
       └── Stage (runs sequentially)
            └── Job (runs in parallel within stage)
                 └── Task (individual build steps)
```

**Example Bamboo Plan:**
```xml
<!-- Bamboo XML Plan Export -->
<plan key="MYAPP-BUILD">
  <stage name="Build">
    <job key="COMPILE">
      <task type="maven3">
        <goals>clean install</goals>
      </task>
    </job>
  </stage>
  <stage name="Test">
    <job key="UNITTEST">
      <task type="maven3">
        <goals>test</goals>
      </task>
    </job>
  </stage>
  <stage name="Deploy">
    <job key="PACKAGE">
      <task type="maven3">
        <goals>package</goals>
      </task>
    </job>
  </stage>
</plan>
```

### GitHub Actions Concepts

**GitHub Actions Structure:**
```
Workflow (YAML file)
  └── Job (runs in parallel by default)
       └── Step (individual build steps)
```

**Equivalent GitHub Actions:**
```yaml
# .github/workflows/build.yml
name: Build Pipeline

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Build with Maven
        run: mvn clean install

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Run Tests
        run: mvn test

  package:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Package Application
        run: mvn package
```

## Migration Strategy

### 1. Inventory Your Bamboo Plans

**Identify what to migrate:**
```bash
# List all Bamboo plans
- Build triggers (branch, schedule, manual)
- Environment variables and secrets
- Build agents and requirements
- Artifact publishing
- Deployment configurations
- Integration tests
- Database migrations
```

### 2. Map Bamboo Components to GitHub Actions

| Bamboo Concept | GitHub Actions Equivalent |
|---------------|---------------------------|
| Plan | Workflow |
| Stage | Job with `needs` dependency |
| Job | Job (parallel by default) |
| Task | Step |
| Artifact | Upload/Download Artifact Actions |
| Repository | Checkout Action |
| Variables | Environment Variables / Secrets |
| Capabilities | Runner Labels |

### 3. Choose Migration Approach

**Parallel Migration (Recommended):**
```
1. Keep Bamboo running
2. Create GitHub Actions workflows
3. Compare outputs
4. Gradually shift to GitHub Actions
5. Decommission Bamboo
```

## Maven Project Migration

### Basic Bamboo Maven Build

**Bamboo Configuration:**
```yaml
# Bamboo build tasks
- Maven 3.x Task
  - Goal: clean install
  - JDK: JDK 17
  - Maven Opts: -Xmx2048m
  - Environment: production
```

**Equivalent GitHub Actions:**
```yaml
# .github/workflows/maven-build.yml
name: Maven Build

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Build with Maven
      run: mvn clean install -B -V
      env:
        MAVEN_OPTS: -Xmx2048m

    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: maven-artifacts
        path: target/*.jar
```

### Advanced Maven with Testing

**Multi-stage Maven Pipeline:**
```yaml
# .github/workflows/maven-advanced.yml
name: Maven CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  MAVEN_OPTS: -Xmx2048m -XX:MaxPermSize=512m

jobs:
  build:
    name: Build and Unit Test
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Maven version
      run: mvn --version

    - name: Compile
      run: mvn clean compile -B

    - name: Run unit tests
      run: mvn test -B

    - name: Generate test reports
      if: always()
      uses: dorny/test-reporter@v1
      with:
        name: Maven Tests
        path: target/surefire-reports/*.xml
        reporter: java-junit

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v4
      with:
        files: target/site/jacoco/jacoco.xml
        flags: unittests

    - name: Package
      run: mvn package -DskipTests -B

    - name: Upload JAR
      uses: actions/upload-artifact@v4
      with:
        name: application-jar
        path: target/*.jar
        retention-days: 5

  integration-test:
    name: Integration Tests
    needs: build
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Run integration tests
      run: mvn verify -Pintegration-tests -B
      env:
        DB_HOST: localhost
        DB_PORT: 5432
        DB_NAME: testdb
        DB_USER: testuser
        DB_PASSWORD: testpass

    - name: Publish test results
      if: always()
      uses: EnricoMi/publish-unit-test-result-action@v2
      with:
        files: target/failsafe-reports/*.xml

  code-quality:
    name: Code Quality Analysis
    needs: build
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Shallow clones disabled for SonarQube

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Cache SonarQube packages
      uses: actions/cache@v4
      with:
        path: ~/.sonar/cache
        key: ${{ runner.os }}-sonar
        restore-keys: ${{ runner.os }}-sonar

    - name: Run SonarQube analysis
      run: |
        mvn clean verify sonar:sonar \
          -Dsonar.projectKey=${{ secrets.SONAR_PROJECT_KEY }} \
          -Dsonar.host.url=${{ secrets.SONAR_HOST_URL }} \
          -Dsonar.login=${{ secrets.SONAR_TOKEN }}
```

### Maven Multi-Module Projects

**Multi-module Maven Build:**
```yaml
# .github/workflows/maven-multimodule.yml
name: Multi-Module Maven Build

on:
  push:
    branches: [ main, develop ]

jobs:
  build-modules:
    name: Build All Modules
    runs-on: ubuntu-latest

    strategy:
      matrix:
        module: [common, service, api, web]

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Build module ${{ matrix.module }}
      run: mvn clean install -pl :${{ matrix.module }} -am -B

    - name: Upload module artifact
      uses: actions/upload-artifact@v4
      with:
        name: ${{ matrix.module }}-jar
        path: ${{ matrix.module }}/target/*.jar

  aggregate-build:
    name: Full Build
    needs: build-modules
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Build all modules
      run: mvn clean install -B

    - name: Verify dependencies
      run: mvn dependency:tree
```

## Gradle Project Migration

### Basic Bamboo Gradle Build

**Bamboo Gradle Configuration:**
```yaml
# Bamboo Gradle Task
- Gradle Task
  - Tasks: clean build
  - JDK: JDK 17
  - Gradle Wrapper: true
  - Switches: --no-daemon --stacktrace
```

**Equivalent GitHub Actions:**
```yaml
# .github/workflows/gradle-build.yml
name: Gradle Build

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Setup Gradle
      uses: gradle/gradle-build-action@v2
      with:
        cache-disabled: false

    - name: Make gradlew executable
      run: chmod +x ./gradlew

    - name: Build with Gradle
      run: ./gradlew clean build --no-daemon --stacktrace

    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: gradle-artifacts
        path: build/libs/*.jar
```

### Advanced Gradle with Kotlin DSL

**Gradle Kotlin DSL Pipeline:**
```yaml
# .github/workflows/gradle-kotlin.yml
name: Gradle Kotlin Build

on:
  push:
    branches: [ main, develop, 'feature/**' ]
  pull_request:
    types: [ opened, synchronize, reopened ]

env:
  GRADLE_OPTS: -Dorg.gradle.daemon=false -Dorg.gradle.parallel=true -Dorg.gradle.caching=true

jobs:
  build:
    name: Build and Test
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Validate Gradle wrapper
      uses: gradle/wrapper-validation-action@v2

    - name: Setup Gradle
      uses: gradle/gradle-build-action@v2
      with:
        gradle-home-cache-cleanup: true

    - name: Build project
      run: ./gradlew build --info

    - name: Run tests with coverage
      run: ./gradlew test jacocoTestReport --continue

    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: test-results
        path: build/test-results/test/*.xml

    - name: Upload coverage reports
      uses: codecov/codecov-action@v4
      with:
        files: build/reports/jacoco/test/jacocoTestReport.xml

    - name: Archive build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: application-jar
        path: build/libs/*.jar

  check:
    name: Code Quality Checks
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Setup Gradle
      uses: gradle/gradle-build-action@v2

    - name: Run Detekt
      run: ./gradlew detekt

    - name: Run Ktlint
      run: ./gradlew ktlintCheck

    - name: Upload Detekt report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: detekt-report
        path: build/reports/detekt/

  dependency-check:
    name: Dependency Vulnerability Check
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Setup Gradle
      uses: gradle/gradle-build-action@v2

    - name: Run dependency check
      run: ./gradlew dependencyCheckAnalyze

    - name: Upload dependency check report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: dependency-check-report
        path: build/reports/dependency-check-report.html
```

## Spring Boot Specific Migration

### Spring Boot with Docker

**Complete Spring Boot Pipeline:**
```yaml
# .github/workflows/spring-boot.yml
name: Spring Boot CI/CD

on:
  push:
    branches: [ main, develop ]
    tags:
      - 'v*'
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    name: Build Spring Boot Application
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Build Spring Boot app
      run: mvn clean package -DskipTests spring-boot:repackage

    - name: Run unit tests
      run: mvn test

    - name: Integration tests with Testcontainers
      run: mvn verify -Pintegration-tests

    - name: Upload JAR
      uses: actions/upload-artifact@v4
      with:
        name: spring-boot-app
        path: target/*.jar

  docker:
    name: Build and Push Docker Image
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Download JAR
      uses: actions/download-artifact@v4
      with:
        name: spring-boot-app
        path: target/

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    name: Deploy to Staging
    needs: docker
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'

    steps:
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment"
        # Add your deployment commands here
        # kubectl apply -f k8s/staging/
        # or helm upgrade --install myapp ./helm-chart
```

### Spring Boot with Gradle and Kotlin

**Kotlin Spring Boot Pipeline:**
```yaml
# .github/workflows/spring-boot-kotlin.yml
name: Spring Boot Kotlin CI

on:
  push:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Setup Gradle
      uses: gradle/gradle-build-action@v2

    - name: Build Spring Boot app
      run: ./gradlew bootJar

    - name: Run tests
      run: ./gradlew test

    - name: Run Spring Boot app for smoke test
      run: |
        ./gradlew bootRun &
        APP_PID=$!
        sleep 30
        curl -f http://localhost:8080/actuator/health || exit 1
        kill $APP_PID

    - name: Build native image (GraalVM)
      if: github.ref == 'refs/heads/main'
      run: ./gradlew nativeCompile

    - name: Upload artifacts
      uses: actions/upload-artifact@v4
      with:
        name: spring-boot-kotlin-app
        path: |
          build/libs/*.jar
          build/native/nativeCompile/
```

## Handling Common Migration Scenarios

### Environment Variables and Secrets

**Bamboo Variables:**
```
# Bamboo Global/Plan Variables
- DB_HOST = localhost
- DB_PORT = 5432
- API_KEY = ${bamboo.secret.api_key}
```

**GitHub Actions Secrets:**
```yaml
# .github/workflows/with-secrets.yml
jobs:
  build:
    runs-on: ubuntu-latest

    env:
      DB_HOST: localhost
      DB_PORT: 5432

    steps:
    - name: Use secrets
      run: |
        echo "API Key is configured"
        curl -H "Authorization: Bearer ${{ secrets.API_KEY }}" \
             -H "X-Custom-Header: ${{ secrets.CUSTOM_HEADER }}" \
             https://api.example.com/deploy
      env:
        API_KEY: ${{ secrets.API_KEY }}
        CUSTOM_HEADER: ${{ secrets.CUSTOM_HEADER }}
```

**Setting up secrets:**
```bash
# GitHub CLI
gh secret set API_KEY -b "your-secret-value"
gh secret set DB_PASSWORD -b "db-password"

# Or via GitHub UI: Settings > Secrets and variables > Actions
```

### Caching Dependencies

**Bamboo Agent Caching:**
```
# Bamboo caches at agent level automatically
```

**GitHub Actions Caching:**
```yaml
# Maven caching (built-in)
- uses: actions/setup-java@v4
  with:
    java-version: '17'
    distribution: 'temurin'
    cache: 'maven'

# Gradle caching (built-in)
- uses: gradle/gradle-build-action@v2
  # Caching is automatic

# Custom caching
- uses: actions/cache@v4
  with:
    path: |
      ~/.m2/repository
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: ${{ runner.os }}-build-${{ hashFiles('**/pom.xml', '**/*.gradle*', '**/gradle-wrapper.properties') }}
    restore-keys: |
      ${{ runner.os }}-build-
```

### Artifact Management

**Bamboo Artifacts:**
```yaml
# Bamboo artifact definition
- Artifact: application-jar
  Location: target/
  Pattern: *.jar
  Shared: true
```

**GitHub Actions Artifacts:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Build
      run: mvn package

    - name: Upload artifacts
      uses: actions/upload-artifact@v4
      with:
        name: application-jar
        path: target/*.jar
        retention-days: 30

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Download artifacts
      uses: actions/download-artifact@v4
      with:
        name: application-jar
        path: artifacts/

    - name: Deploy
      run: |
        ls -la artifacts/
        # Deploy JAR file
```

### Matrix Builds (Multiple Java Versions)

**Test across Java versions:**
```yaml
# .github/workflows/matrix-build.yml
name: Multi-Version Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        java: ['11', '17', '21']
        exclude:
          - os: macos-latest
            java: '11'

    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK ${{ matrix.java }}
      uses: actions/setup-java@v4
      with:
        java-version: ${{ matrix.java }}
        distribution: 'temurin'
        cache: 'maven'

    - name: Build with Maven
      run: mvn clean verify -B

    - name: Test report for Java ${{ matrix.java }}
      if: always()
      uses: dorny/test-reporter@v1
      with:
        name: Tests (Java ${{ matrix.java }} on ${{ matrix.os }})
        path: target/surefire-reports/*.xml
        reporter: java-junit
```

## Best Practices and Optimization

### Workflow Optimization

**Conditional Job Execution:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Build
      run: mvn package

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to staging
      run: echo "Deploying to staging"

  deploy-production:
    needs: build
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to production
      run: echo "Deploying to production"
```

**Path-based Triggers:**
```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'pom.xml'
      - '.github/workflows/**'
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

### Reusable Workflows

**Create reusable workflow:**
```yaml
# .github/workflows/reusable-build.yml
name: Reusable Build Workflow

on:
  workflow_call:
    inputs:
      java-version:
        required: false
        type: string
        default: '17'
      build-command:
        required: false
        type: string
        default: 'mvn clean install'
    secrets:
      maven-settings:
        required: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Set up JDK ${{ inputs.java-version }}
      uses: actions/setup-java@v4
      with:
        java-version: ${{ inputs.java-version }}
        distribution: 'temurin'
        cache: 'maven'

    - name: Build
      run: ${{ inputs.build-command }}
```

**Use reusable workflow:**
```yaml
# .github/workflows/main.yml
name: Main Build

on: [push]

jobs:
  build:
    uses: ./.github/workflows/reusable-build.yml
    with:
      java-version: '17'
      build-command: 'mvn clean package'
    secrets:
      maven-settings: ${{ secrets.MAVEN_SETTINGS }}
```

### Composite Actions

**Create custom action:**
```yaml
# .github/actions/setup-java-build/action.yml
name: 'Setup Java Build Environment'
description: 'Sets up Java with caching for Maven/Gradle'

inputs:
  java-version:
    description: 'Java version to use'
    required: false
    default: '17'
  build-tool:
    description: 'Build tool: maven or gradle'
    required: true

runs:
  using: "composite"
  steps:
    - name: Set up JDK
      uses: actions/setup-java@v4
      with:
        java-version: ${{ inputs.java-version }}
        distribution: 'temurin'
        cache: ${{ inputs.build-tool }}

    - name: Setup Gradle
      if: inputs.build-tool == 'gradle'
      uses: gradle/gradle-build-action@v2
      shell: bash

    - name: Print versions
      shell: bash
      run: |
        java -version
        if [ "${{ inputs.build-tool }}" == "maven" ]; then
          mvn --version
        else
          ./gradlew --version
        fi
```

**Use composite action:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Setup build environment
      uses: ./.github/actions/setup-java-build
      with:
        java-version: '17'
        build-tool: 'maven'

    - name: Build
      run: mvn clean package
```

### Performance Optimization

**Parallel Testing:**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-group: [unit, integration, e2e]

    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: 'maven'

    - name: Run ${{ matrix.test-group }} tests
      run: mvn test -Dgroups=${{ matrix.test-group }}
```

**Build Time Optimization:**
```yaml
# Use build cache effectively
- name: Build with cache
  run: |
    mvn clean package \
      -Dmaven.test.skip=true \
      -Dmaven.javadoc.skip=true \
      -B -V --no-transfer-progress

# Gradle optimization
- name: Build with Gradle
  run: |
    ./gradlew build \
      --build-cache \
      --parallel \
      --max-workers=4 \
      --no-daemon
```

## Migration Checklist

**Pre-Migration:**
```
☐ Document all Bamboo plans and tasks
☐ Identify environment variables and secrets
☐ Map Bamboo capabilities to GitHub runners
☐ Export Bamboo build logs for comparison
☐ Identify integration points (Jira, Confluence, etc.)
☐ Review artifact retention policies
```

**During Migration:**
```
☐ Create GitHub Actions workflows
☐ Set up repository secrets
☐ Configure branch protection rules
☐ Test workflows on feature branch
☐ Compare build times: Bamboo vs GitHub Actions
☐ Verify artifact outputs match
☐ Test deployment pipelines
```

**Post-Migration:**
```
☐ Monitor GitHub Actions runs for failures
☐ Update documentation
☐ Train team on GitHub Actions
☐ Set up status badges
☐ Configure notifications
☐ Review and optimize workflow performance
☐ Decommission Bamboo plans
```

## Common Pitfalls and Solutions

### Issue: Different Working Directories

**Problem:**
```
Bamboo uses /opt/bamboo/build-dir/PROJECT-PLAN-JOB
GitHub Actions uses /home/runner/work/repo/repo
```

**Solution:**
```yaml
# Use relative paths, not absolute
- name: Build
  run: mvn clean package
  working-directory: ./submodule
```

### Issue: Bamboo-Specific Plugins

**Problem:** Bamboo plugins (Artifactory, Jira, Confluence) need alternatives

**Solutions:**
```yaml
# Artifactory integration
- name: Publish to Artifactory
  uses: advancedcsg/action-jfrog-cli@master
  with:
    url: 'https://mycompany.jfrog.io'
    credentials type: 'username'
    user: ${{ secrets.ARTIFACTORY_USER }}
    password: ${{ secrets.ARTIFACTORY_PASSWORD }}
- run: |
    jfrog rt upload "target/*.jar" "libs-release-local/"

# Jira integration
- name: Update Jira ticket
  uses: atlassian/gajira-transition@master
  with:
    issue: ${{ env.JIRA_ISSUE }}
    transition: "In Progress"
  env:
    JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
    JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
```

### Issue: Bamboo Environment Injection

**Problem:** Bamboo injects many variables automatically

**Solution:** Use GitHub Actions context
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Print GitHub context
      run: |
        echo "Branch: ${{ github.ref_name }}"
        echo "Commit: ${{ github.sha }}"
        echo "Actor: ${{ github.actor }}"
        echo "Repo: ${{ github.repository }}"
        echo "Run ID: ${{ github.run_id }}"
        echo "Run Number: ${{ github.run_number }}"
```

## Monitoring and Observability

### Build Status Badges

**Add to README.md:**
```markdown
# Project Name

![Build Status](https://github.com/username/repo/workflows/Build/badge.svg)
![Tests](https://github.com/username/repo/workflows/Tests/badge.svg)
[![codecov](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repo)
```

### Slack Notifications

**Notify on build failures:**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Build
      run: mvn clean package

    - name: Slack notification on failure
      if: failure()
      uses: slackapi/slack-github-action@v1
      with:
        payload: |
          {
            "text": "Build failed for ${{ github.repository }}",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "Build failed for *${{ github.repository }}*\nBranch: `${{ github.ref_name }}`\nCommit: ${{ github.sha }}\nActor: ${{ github.actor }}"
                }
              }
            ]
          }
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Conclusion

Migrating from Bamboo to GitHub Actions modernizes your CI/CD pipeline with:

**Immediate Benefits:**
- Zero infrastructure management
- Native Git integration
- Version-controlled pipelines
- Larger action marketplace

**Long-term Advantages:**
- Lower operational costs
- Faster iteration cycles
- Better developer experience
- Scalable parallel builds

**Next Steps:**
1. Start with a single non-critical project
2. Run Bamboo and GitHub Actions in parallel
3. Compare outputs and timings
4. Gradually migrate remaining projects
5. Optimize workflows based on metrics

**Resources:**
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Maven GitHub Actions Examples](https://github.com/actions/setup-java)
- [Gradle GitHub Actions Guide](https://docs.gradle.org/current/userguide/github-actions.html)
- [Migrating from Other CI Systems](https://docs.github.com/en/actions/migrating-to-github-actions)

The migration requires planning but pays dividends through reduced complexity, better integration, and lower costs. Start small, iterate, and gradually move your entire pipeline to GitHub Actions.
