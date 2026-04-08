# REVIEW PROTOCOL: PRE-COMMIT CHECKLIST
> **Task Reference:** [Link or ID to Task Brief]
> **Scope:** Detecting AI hallucinations and logic errors before repository integration.

---

## 1. LIBRARY & DEPENDENCY VALIDATION
> *Goal: Detect hallucinations of non-existent functions or insecure packages.*

**Key Questions**
* Does this `import` actually exist in the official documentation?
* Is the library secure, maintained, and compatible with our Python version?

**What to Check**
* **Official Docs:** Verify that the methods and attributes called by the AI exist in the current library version.
* **Environment:** Ensure the dependency is correctly defined in the project's dependency management file specified in the Brief.
* **Reliability:** Avoid "ghost" libraries or experimental packages that lack community support.

---

## 2. BUSINESS LOGIC & CALCULATIONS
> *Goal: Identify errors in domain calculations, business rules, and input/output contracts.*

**Key Questions**
* Are edge cases (empty collections, zero division, null inputs) handled?
* Is the precision appropriate for the data types being used?
* Are the calculations consistent with the expected behavior of the core logic?
* Do the outputs match the expected schema and data types defined in the Brief?

**What to Check**
* **Core Logic:** Double-check domain calculations, transformations, and business rules.
* **Data Types:** Ensure value precision and type safety are handled correctly for sensitive operations.
* **Edge Cases:** Verify behavior with boundary values, empty inputs, and unexpected data.
* **Input/Output Contract:** Verify that inputs and outputs match the structures defined in Brief Section 2 (Input Structure / Output Structure).
* **Output Validation:** Confirm that outputs conform to the Output Structure defined in Brief Section 2.
* **Integration Points:** Check that any external API calls or service integrations are correctly implemented and handle responses as expected.

---

## 3. SECURITY & INPUT VALIDATION
> *Goal: Prevent the introduction of vulnerabilities even in functional code.*

**Key Questions**
* Are there any hardcoded credentials, API keys, or exposed secrets?
* Is every input being validated before it is processed by the domain logic?
* Are there any potential injection points (SQL, command line, file paths) that could be exploited?
* Is the code following the principle of least privilege when accessing resources or executing commands?
* Are there any logging statements that could inadvertently expose sensitive information?

**What to Check**
* **Secret Management:** Ensure all credentials (AWS, DB, APIs) are pulled from environment variables.
* **Injection Prevention:** Check that no raw strings are being used for SQL or system commands.
* **Sanitization:** Confirm that file paths and user-provided strings are properly sanitized.
* **Access Control:** Verify that any resource access is done with the minimum necessary permissions.
* **Logging Review:** Audit log statements to ensure no sensitive data is being logged.

---

## 4. CONTEXT & CONSTRAINT ALIGNMENT
> *Goal: Ensure the implementation hasn't drifted from the original Brief requirements.*

**Key Questions**
* Were all specific constraints from the Brief respected (SOLID, Layering)?
* Does the solution still solve the core objective without adding unnecessary "bloat"?
* Are there any new dependencies that violate the project's standards or introduce security risks?
* Does the code maintain the separation of concerns defined in the Brief's architecture?
* Are the new components modular and reusable, adhering to the project's architectural guidelines?

**What to Check**
* **Dependency Guardrails:** Confirm no dependencies outside those approved in Brief Section 2 (Language / Stack) were introduced.
* **Architectural Rules:** Verify the clear separation between the layers or modules defined in the Brief's architecture.
* **Output Format:** Ensure outputs match the Output Structure defined in Brief Section 2 exactly.
* **Modularity:** Check that new components are designed for reuse and maintainability, following the project's modular design principles.
* **Objective Alignment:** Revisit the original task objective to confirm that the implementation directly addresses it without unnecessary features or deviations.

---

## 5. STACK & QUALITY STANDARDS
> *Goal: Verify alignment with the project's stack, standards, and quality requirements defined in the Brief.*

**Key Questions**
* Does the code pass the strict typing and linting requirements of the project?
* Are there automated tests covering all new logic, and do they pass successfully?
* Is the code formatted according to the project's established standards?
* Are there any "TODO" or "Fixme" comments left in the code that indicate incomplete work or known issues?
* Has the code been tested locally to ensure it runs without errors and produces the expected outputs?
* Are there any potential issues with reproducibility, such as non-deterministic behavior or reliance on external state that isn't properly mocked in tests?


**What to Check**
* **Static Analysis:** Run the configured linting and type-checking tools for the project stack to confirm 100% compliance.
* **Test Execution:** Ensure that all test suites pass and cover the core domain logic.
* **Sensitive Data:** Audit log outputs to ensure no sensitive metadata or PII is being recorded.
* **Code Cleanliness:** Verify that no "TODO" or "Fixme" comments remain in the codebase.
* **Local Testing:** Run the code in a local environment to confirm it executes without errors and produces the expected outputs, ensuring that any external dependencies are properly mocked in tests to maintain reproducibility.

---

## 6. DOD VERIFICATION
> *Goal: Ensure every Definition of Done criterion from the Brief is explicitly verified before committing.*

**Key Questions**
* Has each DoD item from the Brief been met and verified independently?
* Is there objective, observable evidence for each criterion (test results, output files, linter reports)?

**What to Check**
* [ ] **Objective Met:** The concrete goal defined in Brief Section 1 is fully achieved and demonstrable.
* [ ] **Decoupling:** Business logic is independent of infrastructure or implementation details.
* [ ] **Execution:** The solution runs without errors and produces the expected outputs.
* [ ] **Integrations:** All required external integrations function correctly end-to-end.
* [ ] **Validation:** Automated tests cover all core logic and critical integration points.
* [ ] **Quality Assurance:** The code passes all configured linting and type-checking tools without warnings or errors.
* [ ] **Final Delivery:** Source code is delivered with up-to-date dependency and configuration files.

---

### Final Verification
- [ ] Section 1: Libraries and dependencies validated.
- [ ] Section 2: Business logic and input/output contract verified.
- [ ] Section 3: Security and input validation reviewed.
- [ ] Section 4: Brief constraints and architecture alignment confirmed.
- [ ] Section 5: Stack quality standards (linting, tests) passed.
- [ ] Section 6: All DoD criteria from the Brief checked off.
- [ ] No "TODO" or "Fixme" comments left in code.