import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
        <Card key={index} className="transition-colors hover:bg-muted/50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CarrierList({ options }: CarrierListProps) {
  return (
    <div className="grid gap-4">
      {options.map((carrier) => (
        <Card
          key={`${carrier.proposalId}-${carrier.vendorId}`}
          className={cn(
            "transition-colors hover:bg-muted/50 cursor-pointer",
            carrier.isCheapestExpress && "border-blue-500"
          )}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-medium">
                  {carrier.isCheapestExpress ? "Express Shipping" : "Standard Shipping"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {carrier.minTransitTime === carrier.maxTransitTime
                    ? `${carrier.minTransitTime} days`
                    : `${carrier.minTransitTime}-${carrier.maxTransitTime} days`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{carrier.price} {carrier.currency}</p>
                {carrier.tryPrice !== carrier.price && (
                  <p className="text-sm text-muted-foreground line-through">
                    {carrier.tryPrice} {carrier.currency}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}