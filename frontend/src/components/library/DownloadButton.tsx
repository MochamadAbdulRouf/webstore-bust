'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';

interface DownloadButtonProps {
  gameId: string;
  gameTitle: string;
  fileUrl?: string | null;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  gameId,
  gameTitle,
  fileUrl,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!fileUrl) {
      toast.error('Game file not available yet');
      return;
    }

    setDownloading(true);
    setProgress(0);

    try {
      // Axios request with progress tracking
      const response = await api.get(`/library/${gameId}/download`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          } else {
            // Fallback if total length is unknown (simulate progress)
            setProgress((p) => Math.min(95, p + 5));
          }
        },
      });

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename or default
      const filename = `${gameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setProgress(100);
      toast.success(`${gameTitle} downloaded successfully!`);
    } catch {
      // If server or network error occurs, fall back to simulated progress for demo
      toast.error('Download failed. Running simulation mode.');
      setProgress(0);
      
      let p = 0;
      const interval = setInterval(() => {
        p += Math.floor(Math.random() * 15) + 5;
        if (p >= 100) {
          clearInterval(interval);
          setProgress(100);
          setDownloading(false);
          toast.success(`${gameTitle} simulated download complete!`);
        } else {
          setProgress(p);
        }
      }, 300);
      return;
    } finally {
      // Keep state showing 100% or loading brief delay before resetting
      setTimeout(() => {
        setDownloading(false);
        setProgress(0);
      }, 2000);
    }
  };

  if (downloading) {
    const isCompleted = progress >= 100;
    return (
      <div style={{ width: '100%', marginTop: 'auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '4px',
          }}
        >
          <span>{isCompleted ? 'Ready to play!' : `Downloading ${gameTitle}...`}</span>
          <span>{Math.min(100, Math.round(progress))}%</span>
        </div>
        <div
          style={{
            height: 6,
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, progress)}%`,
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.1s ease',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Button
      variant={fileUrl ? 'primary' : 'secondary'}
      size="sm"
      onClick={handleDownload}
      style={{ marginTop: 'auto', display: 'flex', gap: '0.375rem', justifyContent: 'center' }}
      disabled={!fileUrl}
    >
      <Download size={14} />
      {fileUrl ? 'Play / Download' : 'Not Available'}
    </Button>
  );
};

export default DownloadButton;
