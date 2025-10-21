import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface NumericKeyboardProps {
    onKeyPress: (key: string) => void;
    onClear: () => void;
    onClose: () => void;
    currentValue: string;
}

const NumericKeyboard = ({ onKeyPress, onClear, onClose, currentValue }: NumericKeyboardProps) => {
    const numericKeys = [
        [ '7', '8', '9' ],
        [ '4', '5', '6' ],
        [ '1', '2', '3' ],
        [ '0', '.', '00' ]
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={onClose}
            />
            <Card className="fixed bottom-0 left-0 right-0 z-50 p-4 rounded-t-2xl rounded-b-none border-t-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-md mx-auto space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-muted-foreground">Enter Payment Amount</h3>
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

                    {/* Display current value */}
                    <div className="bg-muted rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-primary">
                            ₱{currentValue || "0"}
                        </div>
                    </div>

                    {/* Numeric keypad */}
                    {numericKeys.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-3 gap-2">
                            {row.map((key) => (
                                <Button
                                    key={key}
                                    variant="outline"
                                    size="lg"
                                    onClick={() => onKeyPress(key)}
                                    className="h-16 text-2xl font-bold"
                                >
                                    {key}
                                </Button>
                            ))}
                        </div>
                    ))}

                    {/* Bottom row with clear and close */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={onClear}
                            className="h-14 text-lg font-semibold"
                        >
                            Clear
                        </Button>
                        <Button
                            variant="default"
                            size="lg"
                            onClick={onClose}
                            className="h-14 text-lg font-semibold"
                        >
                            <X className="h-5 w-5 mr-2" />
                            Close
                        </Button>
                    </div>
                </div>
            </Card>
        </>
    );
};

export { NumericKeyboard };

