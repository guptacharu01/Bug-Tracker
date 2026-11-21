package com.bugtracker.repository;

import com.bugtracker.entity.Issue;
import com.bugtracker.entity.IssueType;
import com.bugtracker.entity.Priority;
import com.bugtracker.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByProjectId(Long projectId);
    List<Issue> findByAssigneeId(Long assigneeId);
    long countByStatus(Status status);
    long countByAssigneeId(Long assigneeId);

    @Query("select i from Issue i where " +
            "(:projectId is null or i.project.id = :projectId) and " +
            "(:status is null or i.status = :status) and " +
            "(:priority is null or i.priority = :priority) and " +
            "(:assigneeId is null or i.assignee.id = :assigneeId) and " +
            "(:type is null or i.type = :type) and " +
            "(:search is null or lower(i.title) like lower(concat('%', :search, '%')))")
    List<Issue> search(@Param("projectId") Long projectId,
                       @Param("status") Status status,
                       @Param("priority") Priority priority,
                       @Param("assigneeId") Long assigneeId,
                       @Param("type") IssueType type,
                       @Param("search") String search);
}
