'use client';

import { useState } from 'react';
import { Star, ChevronDown, ChevronUp, User } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
  isHelpful?: boolean;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0
    ? (reviews.filter(r => r.rating === star).length / reviews.length * 100)
    : 0
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Reviews ({reviews.length})
        </h3>
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600 w-8">{star} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      {reviews.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort by
          </label>
          <div className="flex gap-2">
            {[
              { value: 'recent' as const, label: 'Most Recent' },
              { value: 'highest' as const, label: 'Highest Rated' },
              { value: 'lowest' as const, label: 'Lowest Rated' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  sortBy === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No reviews yet</p>
          <p className="text-sm text-gray-500">
            Be the first to review this article
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.reviewerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-3">
                <p
                  className={`text-gray-700 text-sm ${
                    expandedReviews.has(review.id) ? '' : 'line-clamp-3'
                  }`}
                >
                  {review.comment}
                </p>
                {review.comment.length > 150 && (
                  <button
                    onClick={() => toggleExpand(review.id)}
                    className="text-blue-600 text-sm hover:underline mt-1 flex items-center gap-1"
                  >
                    {expandedReviews.has(review.id) ? (
                      <>
                        Show less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show more <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Helpful Button */}
              <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Was this helpful?
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
