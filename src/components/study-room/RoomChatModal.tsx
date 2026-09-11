import React from 'react';
import { Modal } from '../common/Modal';
import { useRoom } from '../../context/RoomContext';
import { RoomChatPanel } from './RoomChatPanel';

interface RoomChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFriends?: () => void;
  onReportPeer?: (peerId: string) => void;
}

export const RoomChatModal: React.FC<RoomChatModalProps> = ({
  isOpen,
  onClose,
  onOpenFriends,
  onReportPeer,
}) => {
  const { activeRoom, peers, activeDirectPeerId, allKnownPeers } = useRoom();

  const directFriend = activeDirectPeerId
    ? allKnownPeers.find((p) => p.id === activeDirectPeerId)
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        directFriend
          ? `Direct Message with ${directFriend.name}`
          : `${activeRoom.name} Discussion`
      }
      subtitle={
        directFriend
          ? `1-on-1 focus collaboration • ${directFriend.subjectName}`
          : `${peers.length} Live Studiers • Real-time accountability & focus pledges`
      }
      maxWidth="max-w-2xl"
    >
      <div className="-mt-1">
        <RoomChatPanel
          onOpenFriends={onOpenFriends}
          onReportPeer={onReportPeer}
        />
      </div>
    </Modal>
  );
};
