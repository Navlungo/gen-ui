import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export interface CarrierOption {
  proposalId: number;
  price: number;
  currency: string;
  vendorId: number;
  maxTransitTime: number;
  minTransitTime: number;
  isCheapestExpress: boolean;
  tryPrice: number;
  description: string | null;
  customerName: string | null;
}

interface CarrierListProps {
  options: CarrierOption[];
}

export function CarrierListLoading() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CarrierList({ options }: CarrierListProps) {
  // Sort options by price
  const sortedOptions = [...options].sort((a, b) => a.price - b.price);

  return (
    <div className="grid gap-4">
      {sortedOptions.map((carrier) => {
        const transitTimeText = carrier.minTransitTime === carrier.maxTransitTime
          ? `${carrier.minTransitTime} days`
          : `${carrier.minTransitTime}-${carrier.maxTransitTime} days`;

        return (
          <Card
            key={`${carrier.proposalId}-${carrier.vendorId}`}
            className={cn(
              "cursor-pointer",
              carrier.isCheapestExpress && "border-blue-500"
            )}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-medium">
                      {carrier.isCheapestExpress ? "Express Shipping" : "Standard Shipping"}
                    </p>
                    {carrier.isCheapestExpress && (
                      <Badge className="bg-blue-500">Express</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {transitTimeText}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-medium">
                    {carrier.price.toFixed(2)} {carrier.currency}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {carrier.tryPrice.toFixed(2)} TRY
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}