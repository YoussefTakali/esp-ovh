import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AiService, ChatbotResponse, CodeReviewResult, CodeAnalysisRequest } from '../../services/ai.service';
import { SnackbarService } from '../../shared/services/snackbar.service';

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

@Component({
  selector: 'app-ai-code-review',
  templateUrl: './ai-code-review.component.html',
  styleUrls: ['./ai-code-review.component.css']
})
export class AiCodeReviewComponent implements OnInit {

  analysisForm: FormGroup;
  diffForm: FormGroup;
  chatForm: FormGroup;
  result: CodeReviewResult | null = null;
  isLoading = false;
  isChatLoading = false;
  selectedLanguage = 'java';
  selectedTab = 'code';
  multiLangResult: any = null;
  performanceResult: any = null;
  chatHistory: ChatHistoryItem[] = [];

  languages = [
    { value: 'java', label: 'Java' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'scala', label: 'Scala' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' }
  ];

  codeExamples = {
    java: `public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    
    public int divide(int a, int b) {
        return a / b; // Potential division by zero
    }
}`,
    javascript: `function processData(data) {
    if (!data) {
        console.log("No data provided");
        return;
    }
    
    const result = data.map(item => item.value * 2);
    return result.filter(val => val > 10);
}`,
    python: `def calculate_factorial(n):
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

print(calculate_factorial(5))`,
    cpp: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    int sum = 0;
    
    for (int i = 0; i < numbers.size(); i++) {
        sum += numbers[i];
    }
    
    std::cout << "Sum: " << sum << std::endl;
    return 0;
}`
  };

  diffExample = `diff --git a/src/main/java/Calculator.java b/src/main/java/Calculator.java
index 1a2b3c4..5d6e7f8 100644
--- a/src/main/java/Calculator.java
+++ b/src/main/java/Calculator.java
@@ -8,7 +8,12 @@ public class Calculator {
  public int divide(int a, int b) {
+        if (b == 0) {
+            throw new IllegalArgumentException("Division by zero");
+        }
      return a / b;
  }

@@ -18,6 +23,8 @@ public class Calculator {
  public String buildQuery(String input) {
-        return "SELECT * FROM users WHERE name='" + input + "'";
+        // TODO: Replace with prepared statements
+        return "SELECT * FROM users WHERE name='" + input + "'";
  }
 }`;

  constructor(
    private readonly fb: FormBuilder,
    private readonly aiService: AiService,
    private readonly snackbarService: SnackbarService
  ) {
    this.analysisForm = this.fb.group({
      code: ['', Validators.required],
      language: ['java', Validators.required],
      context: [''],
      fileName: ['']
    });

    this.diffForm = this.fb.group({
      diff: ['', Validators.required],
      language: ['java', Validators.required]
    });

    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(4000)]],
      context: ['']
    });
  }

  ngOnInit(): void {
    this.loadExample();
    this.loadDiffExample();
    this.initializeChatHistory();
  }

  /**
   * Loads a code example for the selected language
   */
  loadExample(): void {
    const example = this.codeExamples[this.selectedLanguage as keyof typeof this.codeExamples];
    if (example) {
      this.analysisForm.patchValue({
        code: example,
        language: this.selectedLanguage
      });
    }
  }

  /**
   * Changes the language and loads an example
   */
  onLanguageChange(): void {
    this.selectedLanguage = this.analysisForm.get('language')?.value;
    this.diffForm.patchValue({ language: this.selectedLanguage });
    this.loadExample();
  }

  /**
   * Loads a pull-request diff example
   */
  loadDiffExample(): void {
    this.diffForm.patchValue({
      diff: this.diffExample,
      language: this.selectedLanguage
    });
  }

  /**
   * Analyzes the code
   */
  analyzeCode(): void {
    if (this.analysisForm.invalid) {
      this.snackbarService.showError('Please enter code to analyze');
      return;
    }

    this.isLoading = true;
    this.result = null;

    const request: CodeAnalysisRequest = {
      code: this.analysisForm.get('code')?.value,
      language: this.analysisForm.get('language')?.value,
      context: this.analysisForm.get('context')?.value || undefined
    };

    this.aiService.analyzeCode(request).subscribe({
      next: (result) => {
        this.result = result;
        this.isLoading = false;
        
        if (result.success) {
          this.snackbarService.showSuccess(`Analysis completed - Score: ${result.overallScore ?? '-'}/10`);
        } else {
          this.snackbarService.showError(`Analysis error: ${result.message}`);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error during analysis:', error);
        this.snackbarService.showError('Error during code analysis');
      }
    });
  }

  /**
   * Analyzes pull-request diff content
   */
  analyzeDiff(): void {
    if (this.diffForm.invalid) {
      this.snackbarService.showError('Please enter a diff to analyze');
      return;
    }

    this.isLoading = true;
    this.result = null;

    const request = {
      diff: this.diffForm.get('diff')?.value,
      language: this.diffForm.get('language')?.value
    };

    this.aiService.analyzeDiff(request).subscribe({
      next: (result) => {
        this.result = result;
        this.isLoading = false;

        if (result.success) {
          this.snackbarService.showSuccess(`PR analysis completed - Decision: ${this.getPullRequestDecisionLabel(result.pullRequestDecision)}`);
        } else {
          this.snackbarService.showError(`PR analysis error: ${result.message}`);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error during diff analysis:', error);
        this.snackbarService.showError('Error during diff analysis');
      }
    });
  }

  /**
   * Tests analysis with a predefined example
   */
  testAnalysis(): void {
    this.isLoading = true;
    this.result = null;

    this.aiService.testCodeAnalysis().subscribe({
      next: (result) => {
        this.result = result;
        this.isLoading = false;
        
        if (result.success) {
          this.snackbarService.showSuccess(`Analysis test completed - Score: ${result.overallScore}/10`);
        } else {
          this.snackbarService.showError(`Test error: ${result.message}`);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error during test:', error);
        this.snackbarService.showError('Error during analysis test');
      }
    });
  }

  /**
   * Tests multi-language analysis
   */
  testMultiLanguage(): void {
    this.isLoading = true;
    this.result = null;
    this.multiLangResult = null;

    // Exemple d'appel dynamique avec payload
    const payload = {
      languages: ['Java', 'Python'],
      codes: {
        Java: 'public class Test { ... }',
        Python: 'def test(): ...'
      }
    };

    this.aiService.testMultiLanguage(payload).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.multiLangResult = result;
        this.snackbarService.showSuccess('Multi-language test completed');
        console.log('Multi-language results:', result);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error during multi-language test:', error);
        this.snackbarService.showError('Error during multi-language test');
      }
    });
  }

  /**
   * Tests performance
   */
  testPerformance(): void {
    this.isLoading = true;
    this.result = null;
    this.performanceResult = null;

    const payload = { size: 500000 };
    this.aiService.testPerformance(payload).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.performanceResult = result;
        this.snackbarService.showSuccess('Performance test completed');
        console.log('Performance test result:', result);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackbarService.showError('Error during performance test');
      }
    });
  }

  /**
   * Changes the active tab
   */
  setActiveTab(tab: string): void {
    this.selectedTab = tab;
  }

  sendChatMessage(): void {
    const rawMessage = this.chatForm.get('message')?.value;
    const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';

    if (!message || this.isChatLoading) {
      return;
    }

    const rawContext = this.chatForm.get('context')?.value;
    const context = typeof rawContext === 'string' ? rawContext.trim() : '';

    this.chatHistory.push({
      role: 'user',
      content: message,
      createdAt: new Date()
    });

    this.chatForm.patchValue({ message: '' });
    this.isChatLoading = true;

    this.aiService.chatWithAssistant({
      message,
      context: context || undefined
    }).subscribe({
      next: (response: ChatbotResponse) => {
        this.isChatLoading = false;

        if (response.success && response.reply) {
          this.chatHistory.push({
            role: 'assistant',
            content: response.reply,
            createdAt: new Date()
          });
          return;
        }

        const fallback = response.message || 'AI chatbot could not generate a response.';
        this.chatHistory.push({
          role: 'assistant',
          content: fallback,
          createdAt: new Date()
        });
        this.snackbarService.showError(fallback);
      },
      error: (error) => {
        this.isChatLoading = false;
        console.error('Error during chatbot request:', error);

        this.chatHistory.push({
          role: 'assistant',
          content: 'Chatbot request failed. Please try again.',
          createdAt: new Date()
        });
        this.snackbarService.showError('Error during chatbot request');
      }
    });
  }

  clearChatHistory(): void {
    this.initializeChatHistory();
  }

  isChatSendDisabled(): boolean {
    const rawMessage = this.chatForm.get('message')?.value;
    const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';
    return this.isChatLoading || !message;
  }

  trackChatMessage(index: number): number {
    return index;
  }

  /**
   * Gets the severity color
   */
  getSeverityColor(severity: string): string {
    return this.aiService.getSeverityColor(severity);
  }

  /**
   * Gets the priority color
   */
  getPriorityColor(priority: string): string {
    return this.aiService.getPriorityColor(priority);
  }

  /**
   * Gets the issue icon
   */
  getIssueIcon(type: string): string {
    return this.aiService.getIssueIcon(type);
  }

  /**
   * Gets the suggestion icon
   */
  getSuggestionIcon(category: string): string {
    return this.aiService.getSuggestionIcon(category);
  }

  /**
   * Gets the score badge
   */
  getScoreBadge(score: number): string {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    if (score >= 4) return 'info';
    return 'danger';
  }

  /**
   * Gets the score text
   */
  getScoreText(score: number): string {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Needs Improvement';
  }

  getRiskClass(riskLevel?: string): string {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'risk-critical';
      case 'HIGH':
        return 'risk-high';
      case 'MEDIUM':
        return 'risk-medium';
      case 'LOW':
        return 'risk-low';
      default:
        return 'risk-unknown';
    }
  }

  getPullRequestDecisionClass(decision?: string): string {
    switch (decision) {
      case 'APPROVE':
        return 'decision-approve';
      case 'REQUEST_CHANGES':
        return 'decision-request-changes';
      case 'COMMENT':
        return 'decision-comment';
      default:
        return 'decision-unknown';
    }
  }

  getPullRequestDecisionLabel(decision?: string): string {
    switch (decision) {
      case 'APPROVE':
        return 'Approve';
      case 'REQUEST_CHANGES':
        return 'Request Changes';
      case 'COMMENT':
        return 'Comment';
      default:
        return 'Not specified';
    }
  }

  getLangIcon(lang: string): string {
    const icons: Record<string, string> = {
      Java: 'fab fa-java',
      Python: 'fab fa-python',
      'C++': 'fas fa-microchip',
      JavaScript: 'fab fa-js-square',
      TypeScript: 'fas fa-code',
      PHP: 'fab fa-php',
      HTML: 'fab fa-html5',
      CSS: 'fab fa-css3-alt'
    };

    return icons[lang] || 'fas fa-code';
  }
  getScoreClass(score: number): string {
    if (score >= 90) return 'score-good';
    if (score >= 70) return 'score-medium';
    return 'score-bad';
  }
  getPerfClass(duration: number): string {
    if (duration < 1000) return 'perf-good';
    if (duration < 3000) return 'perf-medium';
    return 'perf-bad';
  }

  private initializeChatHistory(): void {
    this.chatHistory = [{
      role: 'assistant',
      content: 'Hello! I am your Esprithub AI assistant. Ask me about code, pull requests, or grading logic.',
      createdAt: new Date()
    }];
  }
} 