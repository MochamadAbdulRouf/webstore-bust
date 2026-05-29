'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StarRating } from './StarRating';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  gameId: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ gameId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/games/${gameId}/reviews`, { rating, comment });
      toast.success('Review submitted!');
      setRating(0);
      setComment('');
      onReviewSubmitted();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>
        Write a Review
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">Your Rating</label>
          <StarRating
            rating={0}
            interactive
            value={rating}
            onChange={(r) => setRating(r)}
            size="lg"
          />
        </div>
        
        <Input
          as="textarea"
          label="Your Review"
          style={{ minHeight: 100, resize: 'vertical' }}
          placeholder="Share your experience with this game..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          minLength={10}
          maxLength={1000}
          required
        />

        <Button type="submit" loading={submitting} disabled={submitting}>
          Submit Review
        </Button>
      </form>
    </Card>
  );
};

export default ReviewForm;
