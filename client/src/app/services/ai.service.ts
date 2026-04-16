import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  context?: string;
}

export interface DiffAnalysisRequest {
  diff: string;
  language: string;
}

export interface FileAnalysisRequest {
  fileName: string;
  fileContent: string;
  language: string;
}

export interface ChatbotRequest {
  message: string;
  context?: string;
}

export interface ChatbotResponse {
  success: boolean;
  reply?: string;
  message?: string;
  responseTimeMs?: number;
}

export interface CodeAnalysisNotificationRequest extends CodeAnalysisRequest {
  recipientIds: number[];
  repositoryName: string;
  fileName: string;
}

export interface DiffAnalysisNotificationRequest extends DiffAnalysisRequest {
  recipientIds: number[];
  repositoryName: string;
  pullRequestTitle: string;
}

export interface CodeIssue {
  type: 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'STYLE' | 'MAINTAINABILITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  line?: string;
  description: string;
  suggestion: string;
}

export interface CodeSuggestion {
  category: 'IMPROVEMENT' | 'OPTIMIZATION' | 'BEST_PRACTICE' | 'REFACTORING' | 'DOCUMENTATION';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CodeReviewResult {
  success: boolean;
  message?: string;
  rawResponse?: string;
  overallScore?: number;
  suggestedGrade?: number;
  gradeRationale?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore?: number;
  riskSignals?: string[];
  pullRequestDecision?: 'APPROVE' | 'COMMENT' | 'REQUEST_CHANGES';
  prBlockingConcerns?: string[];
  summary?: string;
  strengths?: string[];
  issues?: CodeIssue[];
  suggestions?: CodeSuggestion[];
  securityConcerns?: string[];
  performanceTips?: string[];
  bestPractices?: string[];
  analyzedLanguage?: string;
  analyzedFile?: string;
  analysisTimeMs?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private readonly baseUrl = `${environment.apiUrl}/api/ai`;

  constructor(private readonly http: HttpClient) { }

  /**
   * Analyse un bloc de code
   */
  analyzeCode(request: CodeAnalysisRequest): Observable<CodeReviewResult> {
    return this.http.post<CodeReviewResult>(`${this.baseUrl}/code-review/analyze`, request);
  }

  /**
   * Analyse un diff de code
   */
  analyzeDiff(request: DiffAnalysisRequest): Observable<CodeReviewResult> {
    return this.http.post<CodeReviewResult>(`${this.baseUrl}/code-review/analyze-diff`, request);
  }

  /**
   * Analyse un fichier complet
   */
  analyzeFile(request: FileAnalysisRequest): Observable<CodeReviewResult> {
    return this.http.post<CodeReviewResult>(`${this.baseUrl}/code-review/analyze-file`, request);
  }

  /**
   * Chatbot conversation using the same AI provider configuration as code review.
   */
  chatWithAssistant(request: ChatbotRequest): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.baseUrl}/code-review/chatbot`, request);
  }

  /**
   * Analyse le code et envoie une notification
   */
  analyzeAndNotify(request: CodeAnalysisNotificationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/code-review/analyze-and-notify`, request);
  }

  /**
   * Analyse un diff et envoie une notification
   */
  analyzeDiffAndNotify(request: DiffAnalysisNotificationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/code-review/analyze-diff-and-notify`, request);
  }

  /**
   * Tests de l'IA
   */
  testCodeAnalysis(): Observable<CodeReviewResult> {
    return this.http.post<CodeReviewResult>(`${this.baseUrl}/test/code-analysis`, {});
  }

  testDiffAnalysis(): Observable<CodeReviewResult> {
    return this.http.post<CodeReviewResult>(`${this.baseUrl}/test/diff-analysis`, {});
  }

  testFileAnalysis(): Observable<CodeReviewResult> {
    return this.http.post<CodeReviewResult>(`${this.baseUrl}/test/file-analysis`, {});
  }

  testMultiLanguage(payload: any = {}): Observable<any> {
    return this.http.post(`${this.baseUrl}/test/multi-language-test`, payload);
  }

  testPerformance(payload: any = {}): Observable<any> {
    return this.http.post(`${this.baseUrl}/test/performance-test`, payload);
  }

  /**
   * Utilitaires pour la détection de langage
   */
  getLanguageFromFileName(fileName: string): string {
    if (!fileName) return 'text';
    
    const lowerFileName = fileName.toLowerCase();
    
    const languageMap: { [key: string]: string } = {
      '.java': 'java',
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.cpp': 'cpp',
      '.cc': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.clj': 'clojure',
      '.hs': 'haskell',
      '.ml': 'ocaml',
      '.f90': 'fortran',
      '.m': 'objective-c',
      '.pl': 'perl',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.sql': 'sql',
      '.xml': 'xml',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
      '.sh': 'bash',
      '.ps1': 'powershell',
      '.bat': 'batch'
    };

    for (const [extension, language] of Object.entries(languageMap)) {
      if (lowerFileName.endsWith(extension)) {
        return language;
      }
    }
    
    return 'text';
  }

  /**
   * Vérifie si un fichier est un fichier de code
   */
  isCodeFile(fileName: string): boolean {
    if (!fileName) return false;
    
    const codeExtensions = [
      '.java', '.js', '.ts', '.py', '.cpp', '.c', '.cs', '.php', '.rb', '.go', 
      '.rs', '.swift', '.kt', '.scala', '.clj', '.hs', '.ml', '.f90', '.m', '.pl',
      '.html', '.css', '.scss', '.sass', '.sql', '.xml', '.json', '.yaml', '.yml',
      '.md', '.sh', '.ps1', '.bat'
    ];
    
    const lowerFileName = fileName.toLowerCase();
    return codeExtensions.some(ext => lowerFileName.endsWith(ext));
  }

  /**
   * Obtient la couleur de sévérité pour l'affichage
   */
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '#dc3545';
      case 'HIGH': return '#fd7e14';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  }

  /**
   * Obtient la couleur de priorité pour l'affichage
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH': return '#007bff';
      case 'MEDIUM': return '#6c757d';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  }

  /**
   * Obtient l'icône pour le type d'issue
   */
  getIssueIcon(type: string): string {
    switch (type) {
      case 'BUG': return 'fas fa-bug';
      case 'SECURITY': return 'fas fa-shield-alt';
      case 'PERFORMANCE': return 'fas fa-gauge-high';
      case 'STYLE': return 'fas fa-paint-brush';
      case 'MAINTAINABILITY': return 'fas fa-wrench';
      default: return 'fas fa-circle-question';
    }
  }

  /**
   * Obtient l'icône pour la catégorie de suggestion
   */
  getSuggestionIcon(category: string): string {
    switch (category) {
      case 'IMPROVEMENT': return 'fas fa-lightbulb';
      case 'OPTIMIZATION': return 'fas fa-rocket';
      case 'BEST_PRACTICE': return 'fas fa-book-open';
      case 'REFACTORING': return 'fas fa-code-branch';
      case 'DOCUMENTATION': return 'fas fa-file-lines';
      default: return 'fas fa-comment-dots';
    }
  }
} 