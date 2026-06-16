'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ArticleReviewProps {
  paperId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  };
  onReviewSubmitted?: () => void;
}

export default function ArticleReview({
  paperId,
  existingReview,
  onReviewSubmitted
}: ArticleReviewProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!session?.user) {
      setError('Please log in to submit a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please provide a more detailed comment (at least 10 characters)');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/papers/${paperId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          comment
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 2000);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (existingReview) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Your Review</h3>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= existingReview.rating
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {existingReview.rating}/5
          </span>
        </div>

        <p className="text-gray-700 text-sm mb-4">{existingReview.comment}</p>

        <p className="text-xs text-gray-500">
          Reviewed on {new Date(existingReview.createdAt).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
      </div>

      {!session?.user ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Please log in to submit a review for this article
          </p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Log In
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {rating > 0 ? `${rating}/5` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this article. What did you like? What could be improved?"
              className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
              minLength={10}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">
                Review submitted successfully!
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>

          {/* Review Guidelines */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Review Guidelines
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Be respectful and constructive in your feedback</li>
              <li>• Focus on the content and quality of the article</li>
              <li>• Provide specific examples to support your rating</li>
              <li>• Avoid personal attacks or offensive language</li>
              <li>• Your review will be visible to other readers</li>
            </ul>
          </div>
        </form>
      )}
    </div>
  );
}
