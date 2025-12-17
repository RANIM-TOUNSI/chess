package com.chess.backend.repository;

import com.chess.backend.model.entity.Invitation;
import com.chess.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.chess.backend.model.enums.InvitationStatus;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    List<Invitation> findByReceiverAndStatus(User receiver, InvitationStatus status);

    List<Invitation> findBySenderAndStatus(User sender, InvitationStatus status);
}
