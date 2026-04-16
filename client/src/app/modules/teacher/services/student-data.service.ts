import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentDataService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  // Get all groups the student is part of
  getStudentGroups(studentEmail: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/student/groups?email=${studentEmail}`);
  }
}
