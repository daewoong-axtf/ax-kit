# Java·Kotlin + Spring Boot 규칙

Java·Kotlin 백엔드 코드와 Spring Boot가 제공하는 Thymeleaf 화면에 적용한다. 지향점: Spring Boot 표준 방식의 Controller → Service → Repository 계층. 생성자 주입과 DTO로 의존성과 노출 범위를 드러낸다.

## JV-1. 버전과 도구

- Java 25 LTS 또는 Kotlin 2.4를 쓴다. 한 모듈 안에서 두 언어를 섞지 않는다. 언어는 템플릿이나 기존 코드를 따르고, 둘 다 없으면 Java를 쓴다.
- JDK 배포처는 템플릿을 따르고, 없으면 Eclipse Temurin을 쓴다. Spring Boot는 지원 중인 최신 안정 버전을 spring.io에서 확인해 고정한다.
- 빌드는 Gradle Kotlin DSL(`build.gradle.kts`)과 Gradle Wrapper(`gradlew`, `gradle/wrapper/`)를 쓰고 커밋한다. 새 프로젝트에 Maven을 쓰지 않는다. 기존 Maven 프로젝트는 전환을 제안한다.
- Java 버전은 toolchain(`JavaLanguageVersion.of(25)`)으로, Kotlin 버전은 Kotlin 플러그인 버전으로 고정한다.
- Spring Boot가 관리하는 라이브러리는 Spring Boot 버전을 따르고 개별 버전을 덮어쓰지 않는다. 그 밖의 라이브러리는 정확한 버전으로 적는다. 버전 범위, `+`, `latest.release`를 쓰지 않는다.
- Gradle 의존성 잠금을 켜고 `gradle.lockfile`을 커밋한다. 취약점 점검은 `osv-scanner`로 한다.
- 포맷과 lint는 Spotless로 묶는다.
  - Java: google-java-format으로 포맷하고, Checkstyle `google_checks.xml`로 검사한다(Google Java Style).
  - Kotlin: ktlint로 포맷·검사한다. `.editorconfig`에 `ktlint_code_style = ktlint_official`을 둔다.
- 실행 명령을 맞춘다.
  - 포맷: `./gradlew spotlessApply`
  - lint·테스트 전체: `./gradlew check`
  - 실행: `./gradlew bootRun`

## JV-2. 프로젝트 구조

템플릿이 없으면 기능별 패키지 구조를 쓴다.

```txt
src/main/java(또는 kotlin)/<회사 패키지>/<앱>/
  Application
  common/config/       # 설정 클래스
  common/security/     # 인증·권한 확인
  common/error/        # 예외와 공통 오류 응답
  common/client/       # 외부 시스템 호출(Gateway)
  <기능>/
    <기능>Controller
    <기능>Service
    <기능>Repository
    <기능>Entity
    dto/               # 요청·응답 DTO
src/main/resources/
  application.yml, application-dev.yml, application-prod.yml
  db/migration/        # Flyway 마이그레이션
src/test/...           # main과 같은 패키지 구조
```

- 클래스는 PascalCase, 메서드·변수는 camelCase, 상수는 UPPER_SNAKE_CASE, 패키지는 소문자로 쓴다.

## JV-3. 아키텍처

- 호출 방향은 Controller → Service → Repository 한 방향이다. Controller는 입력 검증과 응답 변환만 하고, 업무 로직과 트랜잭션(`@Transactional`)은 Service에 둔다.
- Controller는 Entity를 그대로 반환하지 않고 DTO로 바꿔 반환한다(4번). DTO는 Java `record`, Kotlin `data class`로 만든다.
- 입력 검증(9번)은 Jakarta Bean Validation(`@Valid`, `@NotBlank`, `@Size` 등)으로 한다.
- DB는 Spring Data JPA로 다룬다. 직접 쿼리가 필요하면 `@Query`에 파라미터를 바인딩한다. 테이블 구조 변경은 Flyway 마이그레이션으로만 하고, 운영에서는 `spring.jpa.hibernate.ddl-auto=validate`로 둔다(`create`·`update` 금지).
- 의존성은 생성자 주입만 쓴다. 필드에 `@Autowired`를 붙이지 않는다.
- 인증·권한은 Spring Security로 처리한다. 권한 확인은 `common/security/`의 한 곳에 두고 `@PreAuthorize` 등으로 모든 조회 경로에 적용한다(10번).
- 오류는 `@RestControllerAdvice`에서 공통 응답으로 바꾼다. `server.error.include-stacktrace=never`, `server.error.include-message=never`로 둔다.
- 설정은 `application.yml`에 두고 비밀값은 `${DB_PASSWORD}`처럼 환경 변수로 읽는다. 설정 묶음은 `@ConfigurationProperties`로 받는다.
- Actuator를 쓰면 운영에서 `health` 외 엔드포인트를 노출하지 않는다.
- 외부 HTTP 호출은 `RestClient`로 하고 연결·응답 timeout을 지정한다(14번).

## JV-4. 코드 스타일

- Java: `Optional`은 반환값에만 쓰고 필드·인자에 쓰지 않는다. null을 반환하는 대신 `Optional`이나 예외를 쓴다.
- Kotlin: `val`을 기본으로 쓰고, `!!`를 쓰지 않는다. JPA Entity에는 `data class`를 쓰지 않는다. `kotlin-spring`·`kotlin-jpa` 플러그인을 적용한다.
- 로그는 SLF4J로 남긴다. `System.out.println`, `println`, `printStackTrace()`를 쓰지 않는다(12번).
- 예외를 잡아서 아무것도 하지 않고 넘기지 않는다.

## JV-5. 프로필

- `dev`와 `prod` 프로필을 나눈다. 운영 컨테이너는 `prod`로 실행하고, DEBUG 로그·H2 콘솔·개발용 데이터 생성은 `dev`에서만 켠다.

## JV-6. 테스트

- 테스트는 JUnit 5와 Spring Boot Test로 쓴다. Controller는 `@WebMvcTest`와 MockMvc로 테스트한다. Kotlin은 MockK를 써도 된다.
- 권한 테스트(15번)는 `spring-security-test`(`@WithMockUser` 등)로 권한 없는 사용자가 차단되는지 확인한다.
- 테스트가 없는 프로젝트는 `@SpringBootTest`와 MockMvc로 엔드포인트마다 현재 응답을 JSON 파일로 기록해 비교하는 특성 테스트를 만든다. 외부 HTTP 호출은 `MockRestServiceServer`로 가짜 응답을 준다. 테스트 DB는 Testcontainers로 운영과 같은 엔진(PostgreSQL)을 쓴다.
- 시나리오(S-n)는 MockMvc 테스트로 만들고 `@DisplayName("S-01 ...")`으로 시나리오 ID를 붙인다. TDD 단위 테스트는 JUnit 5로 Service·도메인 클래스 단위로 만든다.

## JV-7. 아키텍처 패턴과 리팩토링

Spring은 PoEAA 패턴을 거의 그대로 구현한다. 직접 만들지 않고 Spring 기능을 쓴다.

| 위치(JV-2)       | PoEAA 패턴                                         | Spring 구현                        |
| ---------------- | -------------------------------------------------- | ---------------------------------- |
| Controller       | Remote Facade                                      | `@RestController`                  |
| `dto/`           | DTO                                                | Java `record`, Kotlin `data class` |
| Service          | Service Layer                                      | `@Service` + `@Transactional`      |
| Repository       | Repository                                         | Spring Data `JpaRepository`        |
| Entity + JPA     | Data Mapper, Unit of Work, Identity Map, Lazy Load | Hibernate 영속성 컨텍스트          |
| `common/client/` | Gateway                                            | `RestClient`를 감싼 클래스         |

- 업무 로직은 Service의 Transaction Script로 시작한다. 규칙이 복잡해지면 Entity에 의도를 드러내는 메서드(`approve()`, `cancel()`)를 두는 Domain Model로 옮긴다. Entity의 setter는 공개하지 않는다(세터 제거하기).
- 연관관계는 지연 로딩(`fetch = FetchType.LAZY`)을 기본으로 하고, 목록 조회는 fetch join이나 `@EntityGraph`로 N+1 조회를 막는다. `spring.jpa.open-in-view=false`로 둔다.
- 여러 사람이 같은 데이터를 고칠 수 있으면 `@Version`으로 Optimistic Lock을 건다.
- 금액·기간 같은 값은 `@Embeddable` Value Object로 만든다.
- Entity 상속은 피한다. 꼭 필요하면 `SINGLE_TABLE` 전략을 쓴다.
- Java·Kotlin에 맞게 바꿔 적용한다.
  - 조건부 로직을 다형성으로 바꾸기 → Java는 `sealed interface` + `switch` 패턴 매칭, Kotlin은 `sealed class` + `when`으로 한다.
  - 상속보다 위임을 쓴다(서브클래스를 위임으로 바꾸기, 슈퍼클래스를 위임으로 바꾸기).
  - 기본형을 객체로 바꾸기 → Java는 `record`, Kotlin은 `@JvmInline value class`로 만든다.
  - 특이 케이스 추가하기 → Java는 `Optional`, Kotlin은 nullable 타입과 `?:`로 "없음"을 한곳에서 처리한다.

## JV-8. Spring Boot + Thymeleaf 화면

JV 규칙을 쓰는 앱이 화면을 Spring Boot에서 함께 제공하면 Thymeleaf를 쓴다(`spring-boot-starter-thymeleaf`). 프론트엔드와 백엔드를 나눈 앱은 화면에 TS 규칙을 적용한다. 이 구조에는 TS 규칙(TS-1~TS-9)을 적용하지 않고 아래를 따른다. 새로 JSP로 만들지 않는다.

- HTML은 `src/main/resources/templates/`, JavaScript·CSS는 `src/main/resources/static/`에 둔다. 실제 업무 데이터는 두지 않는다(3번). 한 파일이 300줄을 넘으면 기능별로 나눈다.
- 화면을 돌려주는 Controller는 `@Controller`로 쓰고, 입력 검증과 응답 변환만 한다. 업무 로직, DB 접근, 권한 판단은 Service 이하에 둔다(JV-3).
- 템플릿에는 Entity를 넘기지 않고 DTO만 넘긴다(JV-3).
- 값은 `th:text`로 출력한다. `th:utext`를 쓰지 않는다. JavaScript로 화면에 넣을 때는 `textContent`를 쓰고, HTML로 그려야 하면 DOMPurify로 정리한 뒤 넣는다(9번).
- 사용자 입력을 뷰 이름이나 Thymeleaf 표현식에 넣지 않는다(9번).
- 폼은 `th:action`으로 만들고 Spring Security의 CSRF 보호를 끄지 않는다.
- 화면 경로에도 API와 같은 권한 확인을 적용한다(10번). 템플릿에서 메뉴를 숨기는 것은 권한 확인이 아니다.
- 화면 오류는 `@ControllerAdvice`에서 공통 오류 화면으로 바꾼다. 오류 화면에 코드·설정·비밀정보를 보여 주지 않는다(10번).
- 외부 스크립트는 파일을 내려받아 `static/`에서 제공하고, 버전을 파일 이름이나 `README.md`에 남긴다. 외부 URL에서 불러오지 않는다(11번).
- 보안 헤더(11번)는 Spring Security 설정으로 오류·리다이렉트를 포함한 모든 응답에 적용한다.
- 로그인·권한·핵심 흐름(15번)은 Playwright E2E 테스트로 `src/test/`의 `e2e` 패키지에 둔다. 화면이 없는 시나리오는 JV-6을 따른다.

## JV-9. 파일 저장

- 업로드·생성 파일의 저장 위치는 `UPLOAD_DIR` 환경 변수로 읽고, 값이 없으면 `./uploads`를 쓴다(17번). 경로를 코드에 직접 쓰지 않는다.
- 사용자가 보낸 파일 이름은 그대로 경로에 붙이지 않고, 정해진 폴더 밖으로 나가지 못하게 검사한다(9번). 아래 예시는 위치를 읽는 부분만 보여 준다.

```kotlin
val uploadDir = System.getenv("UPLOAD_DIR") ?: "./uploads"

val target = java.nio.file.Path.of(uploadDir, fileName)
```
