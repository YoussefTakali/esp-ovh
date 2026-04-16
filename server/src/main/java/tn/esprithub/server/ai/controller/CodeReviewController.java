package tn.esprithub.server.ai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprithub.server.ai.CodeReviewService;
import tn.esprithub.server.ai.dto.CodeReviewResult;
import tn.esprithub.server.notification.CodeReviewNotificationService;
import tn.esprithub.server.user.entity.User;
import tn.esprithub.server.user.dto.UserDto;
import tn.esprithub.server.user.service.UserService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai/code-review")
@RequiredArgsConstructor
@Slf4j
public class CodeReviewController {

    private final CodeReviewService codeReviewService;
    private final CodeReviewNotificationService notificationService;
    private final UserService userService;

    /**
     * Analyse un bloc de code
     */
    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'CHIEF', 'ADMIN')")
    public ResponseEntity<CodeReviewResult> analyzeCode(@RequestBody CodeAnalysisRequest request) {
        log.info("Code analysis request received for language: {}", request.getLanguage());
        
        CodeReviewResult result = codeReviewService.analyzeCode(
            request.getCode(), 
            request.getLanguage(), 
            request.getContext()
        );
        
        return ResponseEntity.ok(result);
    }

    /**
     * Analyse un diff de code
     */
    @PostMapping("/analyze-diff")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'CHIEF', 'ADMIN')")
    public ResponseEntity<CodeReviewResult> analyzeDiff(@RequestBody DiffAnalysisRequest request) {
        log.info("Diff analysis request received for language: {}", request.getLanguage());
        
        CodeReviewResult result = codeReviewService.analyzeDiff(
            request.getDiff(), 
            request.getLanguage()
        );
        
        return ResponseEntity.ok(result);
    }

    /**
     * Chatbot endpoint for Assistant IA module.
     * Uses the same provider/model configuration as code review.
     */
    @PostMapping("/chatbot")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'CHIEF', 'ADMIN')")
    public ResponseEntity<ChatbotResponse> chatWithAssistant(@RequestBody ChatbotRequest request) {
        String message = request != null ? request.getMessage() : null;

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.ok(ChatbotResponse.failure("Please enter a message before sending."));
        }

        long startedAt = System.currentTimeMillis();

        try {
            String reply = codeReviewService.chatWithAssistant(message, request.getContext());
            return ResponseEntity.ok(ChatbotResponse.success(reply, System.currentTimeMillis() - startedAt));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            log.warn("AI chatbot request rejected: {}", ex.getMessage());
            return ResponseEntity.ok(ChatbotResponse.failure(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Unexpected AI chatbot error", ex);
            return ResponseEntity.ok(ChatbotResponse.failure("Failed to generate chatbot response: " + ex.getMessage()));
        }
    }

    /**
     * Analyse un fichier complet
     */
    @PostMapping("/analyze-file")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'CHIEF', 'ADMIN')")
    public ResponseEntity<CodeReviewResult> analyzeFile(@RequestBody FileAnalysisRequest request) {
        log.info("File analysis request received for file: {}", request.getFileName());
        
        CodeReviewResult result = codeReviewService.analyzeFile(
            request.getFileName(), 
            request.getFileContent(), 
            request.getLanguage()
        );
        
        return ResponseEntity.ok(result);
    }

    /**
     * Analyse le code et envoie une notification
     */
    @PostMapping("/analyze-and-notify")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'CHIEF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeAndNotify(@RequestBody CodeAnalysisNotificationRequest request) {
        log.info("Code analysis with notification request received");
        
        // Récupérer les destinataires
        List<UserDto> userDtos = userService.getUsersByIds(request.getRecipientIds());
        // Convertir DTOs vers entités (temporaire - à améliorer)
        List<User> recipients = userDtos.stream()
            .map(dto -> {
                User user = new User();
                user.setId(dto.getId());
                user.setEmail(dto.getEmail());
                user.setFirstName(dto.getFirstName());
                user.setLastName(dto.getLastName());
                return user;
            })
            .toList();
        
        // Analyser le code
        CodeReviewResult result = codeReviewService.analyzeCode(
            request.getCode(), 
            request.getLanguage(), 
            request.getContext()
        );
        
        // Envoyer la notification
        notificationService.analyzeAndNotify(
            request.getCode(),
            request.getLanguage(),
            request.getContext(),
            recipients,
            request.getRepositoryName(),
            request.getFileName()
        );
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Code analysis completed and notification sent",
            "analysisResult", result
        ));
    }

    /**
     * Analyse un diff et envoie une notification
     */
    @PostMapping("/analyze-diff-and-notify")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'CHIEF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeDiffAndNotify(@RequestBody DiffAnalysisNotificationRequest request) {
        log.info("Diff analysis with notification request received");
        
        // Récupérer les destinataires
        List<UserDto> userDtos = userService.getUsersByIds(request.getRecipientIds());
        // Convertir DTOs vers entités (temporaire - à améliorer)
        List<User> recipients = userDtos.stream()
            .map(dto -> {
                User user = new User();
                user.setId(dto.getId());
                user.setEmail(dto.getEmail());
                user.setFirstName(dto.getFirstName());
                user.setLastName(dto.getLastName());
                return user;
            })
            .toList();
        
        // Analyser le diff
        CodeReviewResult result = codeReviewService.analyzeDiff(
            request.getDiff(), 
            request.getLanguage()
        );
        
        // Envoyer la notification
        notificationService.analyzeDiffAndNotify(
            request.getDiff(),
            request.getLanguage(),
            recipients,
            request.getRepositoryName(),
            request.getPullRequestTitle()
        );
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Diff analysis completed and notification sent",
            "analysisResult", result
        ));
    }

    /**
     * Test de l'analyse de code (pour les tests)
     */
    @PostMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CodeReviewResult> testAnalysis() {
        log.info("Test code analysis request received");
        
        String testCode = """
            public class Calculator {
                public int add(int a, int b) {
                    return a + b;
                }
                
                public int divide(int a, int b) {
                    return a / b; // Potential division by zero
                }
            }
            """;
        
        CodeReviewResult result = codeReviewService.analyzeCode(
            testCode, 
            "java", 
            "Test calculator class"
        );
        
        return ResponseEntity.ok(result);
    }

    // Classes de requête
    public static class CodeAnalysisRequest {
        private String code;
        private String language;
        private String context;

        // Getters et setters
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public String getContext() { return context; }
        public void setContext(String context) { this.context = context; }
    }

    public static class DiffAnalysisRequest {
        private String diff;
        private String language;

        // Getters et setters
        public String getDiff() { return diff; }
        public void setDiff(String diff) { this.diff = diff; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
    }

    public static class ChatbotRequest {
        private String message;
        private String context;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getContext() { return context; }
        public void setContext(String context) { this.context = context; }
    }

    public static class ChatbotResponse {
        private boolean success;
        private String reply;
        private String message;
        private Long responseTimeMs;

        public static ChatbotResponse success(String reply, Long responseTimeMs) {
            ChatbotResponse response = new ChatbotResponse();
            response.success = true;
            response.reply = reply;
            response.responseTimeMs = responseTimeMs;
            return response;
        }

        public static ChatbotResponse failure(String message) {
            ChatbotResponse response = new ChatbotResponse();
            response.success = false;
            response.message = message;
            return response;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getReply() { return reply; }
        public void setReply(String reply) { this.reply = reply; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Long getResponseTimeMs() { return responseTimeMs; }
        public void setResponseTimeMs(Long responseTimeMs) { this.responseTimeMs = responseTimeMs; }
    }

    public static class FileAnalysisRequest {
        private String fileName;
        private String fileContent;
        private String language;

        // Getters et setters
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public String getFileContent() { return fileContent; }
        public void setFileContent(String fileContent) { this.fileContent = fileContent; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
    }

    public static class CodeAnalysisNotificationRequest extends CodeAnalysisRequest {
        private List<UUID> recipientIds;
        private String repositoryName;
        private String fileName;

        // Getters et setters
        public List<UUID> getRecipientIds() { return recipientIds; }
        public void setRecipientIds(List<UUID> recipientIds) { this.recipientIds = recipientIds; }
        public String getRepositoryName() { return repositoryName; }
        public void setRepositoryName(String repositoryName) { this.repositoryName = repositoryName; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
    }

    public static class DiffAnalysisNotificationRequest extends DiffAnalysisRequest {
        private List<UUID> recipientIds;
        private String repositoryName;
        private String pullRequestTitle;

        // Getters et setters
        public List<UUID> getRecipientIds() { return recipientIds; }
        public void setRecipientIds(List<UUID> recipientIds) { this.recipientIds = recipientIds; }
        public String getRepositoryName() { return repositoryName; }
        public void setRepositoryName(String repositoryName) { this.repositoryName = repositoryName; }
        public String getPullRequestTitle() { return pullRequestTitle; }
        public void setPullRequestTitle(String pullRequestTitle) { this.pullRequestTitle = pullRequestTitle; }
    }
} 