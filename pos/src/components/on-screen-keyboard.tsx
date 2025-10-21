import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Delete, X } from "lucide-react";

interface OnScreenKeyboardProps {
    onKeyPress: (key: string) => void;
    onBackspace: () => void;
    onClear: () => void;
    onClose: () => void;
}

const OnScreenKeyboard = ({ onKeyPress, onBackspace, onClear, onClose }: OnScreenKeyboardProps) => {
    const keys = [
        [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ],
        [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l' ],
        [ 'z', 'x', 'c', 'v', 'b', 'n', 'm' ]
    ];

    const numbers = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ];
    const specialChars = [ '@', '.', '_', '-', '.com' ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={onClose}
            />
            <Card className="fixed bottom-0 left-0 right-0 z-50 p-4 rounded-t-2xl rounded-b-none border-t-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-4xl mx-auto space-y-2">
                    {/* Close button */}
                    <div className="flex justify-end mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Close
                        </Button>
                    </div>

                    {/* Numbers row */}
                    <div className="flex gap-1 justify-center">
                        {numbers.map((key) => (
                            <Button
                                key={key}
                                variant="outline"
                                size="lg"
                                onClick={() => onKeyPress(key)}
                                className="flex-1 h-12 text-lg font-semibold"
                            >
                                {key}
                            </Button>
                        ))}
                    </div>

                    {/* Letter rows */}
                    {keys.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-1 justify-center">
                            {row.map((key) => (
                                <Button
                                    key={key}
                                    variant="outline"
                                    size="lg"
                                    onClick={() => onKeyPress(key)}
                                    className="flex-1 h-12 text-lg font-semibold"
                                >
                                    {key}
                                </Button>
                            ))}
                        </div>
                    ))}

                    {/* Special characters row */}
                    <div className="flex gap-1 justify-center">
                        {specialChars.map((key) => (
                            <Button
                                key={key}
                                variant="outline"
                                size="lg"
                                onClick={() => onKeyPress(key)}
                                className="flex-1 h-12 text-lg font-semibold"
                            >
                                {key}
                            </Button>
                        ))}
                    </div>

                    {/* Bottom row with space and special keys */}
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={onClear}
                            className="flex-1 h-12"
                        >
                            Clear
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => onKeyPress(' ')}
                            className="flex-[3] h-12 text-lg"
                        >
                            Space
                        </Button>
                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={onBackspace}
                            className="flex-1 h-12"
                        >
                            <Delete className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </Card>
        </>
    );
};

export { OnScreenKeyboard };

