import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";

interface ReviewFormProps {
    productId: string;
    saleId: string;
    productName: string;
    productThumbnail: string;
    onReviewSubmitted: () => void;
    onCancel: () => void;
}

export const ReviewForm = ({
    productId,
    saleId,
    productName,
    productThumbnail,
    onReviewSubmitted,
    onCancel
}: ReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            await apiService.createReview({
                productId,
                saleId,
                rating,
                title: title.trim() || undefined,
                comment: comment.trim() || undefined,
            });
            
            toast.success("Review submitted successfully!");
            onReviewSubmitted();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 flex-shrink-0">
                    <img
                        src={getImageUrl(productThumbnail)}
                        alt={productName}
                        className="w-full h-full object-cover rounded"
                    />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">{productName}</h3>
                    <p className="text-sm text-muted-foreground">Write a review for this product</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Rating *</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                            >
                                <Star
                                    className={`h-8 w-8 transition-colors ${
                                        star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300 hover:text-yellow-300'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent"}
                        </p>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label htmlFor="title" className="text-sm font-medium mb-2 block">
                        Review Title (Optional)
                    </label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Summarize your review in a few words"
                        maxLength={100}
                    />
                </div>

                {/* Comment */}
                <div>
                    <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                        Review Comment (Optional)
                    </label>
                    <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {comment.length}/500 characters
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        type="submit"
                        disabled={isSubmitting || rating === 0}
                        className="flex items-center gap-2"
                    >
                        <Send className="h-4 w-4" />
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Card>
    );
};
