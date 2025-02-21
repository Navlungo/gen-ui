import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { CUSTOM_UI_YIELD_NAME } from "@/utils/server";
import { CarrierList, CarrierListLoading } from "@/components/prebuilt/CarrierList";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";

interface ShippingResponse {
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

const shippingCalculatorSchema = z.object({
  toCountry: z.string().describe("The destination country code (e.g., DE, FR, US)"),
  weight: z.number().describe("The weight of the package in kilograms"),
});

// API configuration
const API_CONFIG = {
  baseUrl: 'https://api-qa.navlungo.com/api',
  defaultFromCountry: 'TR',
  headers: {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'tr-TR',
    'authorization': `Bearer ${process.env.NAVLUNGO_API_TOKEN}`,
    'origin': 'https://ship-qa.navlungo.com',
    'priority': 'u=1, i',
    'referer': 'https://ship-qa.navlungo.com/ship/priceCalculator',
    'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
  }
};

async function calculateShipping(input: z.infer<typeof shippingCalculatorSchema>) {
  if (!process.env.NAVLUNGO_API_TOKEN) {
    throw new Error("Missing NAVLUNGO_API_TOKEN secret.");
  }

  try {
    // Construct the API URL with query parameters
    const url = new URL(`${API_CONFIG.baseUrl}/Calculations/calculate`);
    url.searchParams.append('ToCountry', input.toCountry);
    url.searchParams.append('FromCountry', API_CONFIG.defaultFromCountry);
    url.searchParams.append('Weight', input.weight.toString());

    console.log('🟦 [ShippingCalculator] Calling API:', url.toString());

    // Make the API request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data: ShippingResponse[] = await response.json();

    console.log('🟦 [ShippingCalculator] API Response:', {
      status: response.status,
      optionsCount: data.length,
    });

    return data;
  } catch (error) {
    console.error('🔴 [ShippingCalculator] Error:', error);
    return "Failed to calculate shipping costs. Please check your input parameters.";
  }
}

export const shippingCalculatorTool = tool(
  async (input, config) => {
    // Show loading state
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <CarrierListLoading />,
          type: "append",
        },
      },
      config,
    );

    const result = await calculateShipping(input);

    if (typeof result === "string") {
      // Failed to parse, return error message
      await dispatchCustomEvent(
        CUSTOM_UI_YIELD_NAME,
        {
          output: {
            value: <p className="text-red-500">{result}</p>,
            type: "update",
          },
        },
        config,
      );
      return result;
    }

    // Update with actual results
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <CarrierList options={result} />,
          type: "update",
        },
      },
      config,
    );

    return JSON.stringify(result);
  },
  {
    name: "calculate_shipping",
    description: "Calculate shipping costs between countries with weight. Returns available carrier options with prices and transit times.",
    schema: shippingCalculatorSchema,
  },
);
