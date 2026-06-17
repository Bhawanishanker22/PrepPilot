package com.preppilot.backend.repository;

import com.preppilot.backend.model.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    List<UserAnswer> findByInterviewId(Long interviewId);
}