import { GoogleGenAI } from '@google/genai';
import { db } from '../config/db';
import { RecommendationService } from './recommendationService';
import { CartModel } from '../models/Cart';
import { Product, Order, ChatMessage } from '../../frontend/src/types';

export class AIService {
  private static getAIClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  static async processShoppingQuery(
    sessionId: string,
    query: string,
    userId: string = 'user-priya',
    currentProductId?: string
  ): Promise<{
    reply: string;
    recommendedProducts?: Product[];
    actionTaken?: ChatMessage['actionTaken'];
  }> {
    const userOrders = db.findOrdersByUserId(userId);
    const userCart = db.carts[userId] || [];
    const productsCatalog = db.products.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      category: p.category,
      rating: p.rating,
      colors: p.colors,
      fabric: p.fabric,
      tags: p.tags,
    }));

    const cleanQuery = query.toLowerCase().trim();

    // 1. Check for "Mera order kaha hai?" / Order tracking queries
    if (
      cleanQuery.includes('order') &&
      (cleanQuery.includes('kaha') ||
        cleanQuery.includes('kahan') ||
        cleanQuery.includes('status') ||
        cleanQuery.includes('track') ||
        cleanQuery.includes('kab aayega') ||
        cleanQuery.includes('where is'))
    ) {
      if (userOrders.length === 0) {
        return {
          reply: 'Aapka abhi koi active order nahi hai. Aap marketplace se trendy sarees, kurtis ya jewellery order kar sakte hain!',
        };
      }
      const latestOrder = userOrders[0];
      const statusHindiMap: Record<string, string> = {
        ordered: 'Placed (Supplier confirm kar raha hai)',
        packed: 'Packed & Quality Checked',
        shipped: 'Shipped (Courier partner ke paas hai)',
        in_transit: 'In Transit (Raaste me hai)',
        out_for_delivery: 'Out for delivery (Aaj deliver hoga)',
        delivered: 'Delivered (Pahunch chuka hai)',
      };

      const itemsList = latestOrder.items.map((i) => `${i.title} (${i.quantity}x)`).join(', ');
      const statusText = statusHindiMap[latestOrder.status] || latestOrder.status;

      return {
        reply: `📦 Aapka Order #${latestOrder.orderNumber} filhal **${statusText}** hai!\n\n` +
          `• **Items:** ${itemsList}\n` +
          `• **Courier Partner:** ${latestOrder.courierPartner} (${latestOrder.trackingNumber})\n` +
          `• **Expected Delivery:** ${latestOrder.estimatedDelivery}\n` +
          `• **Address:** ${latestOrder.shippingAddress.area}, ${latestOrder.shippingAddress.city}`,
        actionTaken: {
          type: 'VIEW_ORDER',
          data: { orderId: latestOrder.id },
          message: 'Order status checked',
        },
      };
    }

    // 2. Check for "Add the black one to my cart" / Add to cart queries
    if (
      (cleanQuery.includes('add') || cleanQuery.includes('daal do') || cleanQuery.includes('cart me') || cleanQuery.includes('kharidna')) &&
      (cleanQuery.includes('cart') || cleanQuery.includes('bag'))
    ) {
      let targetProduct: Product | undefined;

      if (cleanQuery.includes('black')) {
        targetProduct = db.products.find(
          (p) =>
            p.colors.some((c) => c.toLowerCase().includes('black')) ||
            p.tags.includes('black') ||
            p.title.toLowerCase().includes('black')
        );
      } else if (cleanQuery.includes('kurti')) {
        targetProduct = db.products.find((p) => p.tags.includes('kurti'));
      } else if (cleanQuery.includes('saree')) {
        targetProduct = db.products.find((p) => p.tags.includes('saree'));
      } else if (cleanQuery.includes('jhumka') || cleanQuery.includes('earring')) {
        targetProduct = db.products.find((p) => p.tags.includes('jhumka'));
      } else if (currentProductId) {
        targetProduct = db.findProductById(currentProductId);
      }

      if (targetProduct) {
        CartModel.addItem(userId, targetProduct.id, 1, targetProduct.colors[0], targetProduct.sizes[0], 0);
        return {
          reply: `🎉 Maine **"${targetProduct.title}"** (₹${targetProduct.price}) aapke cart me add kar diya hai! Aap Cart page pe jaake directly checkout ya reselling margin set kar sakte hain.`,
          recommendedProducts: [targetProduct],
          actionTaken: {
            type: 'ADD_TO_CART',
            data: { productId: targetProduct.id },
            message: `Added ${targetProduct.title} to cart`,
          },
        };
      }
    }

    // 3. Try Gemini API first if configured
    const ai = this.getAIClient();
    if (ai) {
      try {
        const systemPrompt = `You are "Shopzy AI", an intelligent, cheerful, and trustworthy Indian shopping assistant for Shopzy (a social commerce marketplace inspired by wholesale-to-consumer & reselling pricing).
Tone: Friendly, culturally aware, speaking naturally in Indian Hinglish (or Hindi/English depending on user tone). Use helpful emojis like 🛍️, ✨, 👗, 📦.
Catalog Context:
${JSON.stringify(productsCatalog, null, 2)}

User Orders:
${JSON.stringify(
  userOrders.map((o) => ({ id: o.id, orderNumber: o.orderNumber, status: o.status, estDelivery: o.estimatedDelivery })),
  null,
  2
)}

Current Viewed Product: ${currentProductId || 'None'}

Instructions:
1. Respond to user's shopping need.
2. If recommending products, refer ONLY to products from the catalog above by exact title and price.
3. You MUST provide your response in JSON format with the schema:
{
  "reply": "friendly explanation in Hinglish/English",
  "recommendedProductIds": ["id1", "id2"],
  "action": "ADD_TO_CART" | "VIEW_ORDER" | "NONE",
  "actionProductId": "optional product id"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: query,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          const recProducts = (parsed.recommendedProductIds || [])
            .map((id: string) => db.findProductById(id))
            .filter(Boolean) as Product[];

          let actionTaken = undefined;
          if (parsed.action === 'ADD_TO_CART' && parsed.actionProductId) {
            const p = db.findProductById(parsed.actionProductId);
            if (p) {
              CartModel.addItem(userId, p.id, 1, p.colors[0], p.sizes[0], 0);
              actionTaken = {
                type: 'ADD_TO_CART' as const,
                data: { productId: p.id },
                message: `Added ${p.title} to cart`,
              };
            }
          }

          return {
            reply: parsed.reply,
            recommendedProducts: recProducts.length > 0 ? recProducts : undefined,
            actionTaken,
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, using smart rule-based fallback engine:', err);
      }
    }

    // 4. Smart Rule-Based Fallback Engine (Fulfills all queries reliably!)

    // Wedding kurti under 800
    if (
      (cleanQuery.includes('wedding') || cleanQuery.includes('shadi') || cleanQuery.includes('festive')) &&
      cleanQuery.includes('kurti')
    ) {
      const kurtis = db.products.filter(
        (p) => (p.tags.includes('kurti') || p.tags.includes('anarkali')) && p.price <= 800
      );
      return {
        reply: `✨ Wedding aur festive functions ke liye yeh Anarkali kurtis best hain under ₹800! Heavy embroidered work aur rich colors hain jo shaadi ke functions (sangeet/reception) me bohot khoobsurat lagenge:`,
        recommendedProducts: kurtis.length > 0 ? kurtis : db.products.slice(0, 2),
      };
    }

    // Cheaper / similar alternative
    if (cleanQuery.includes('cheaper') || cleanQuery.includes('sasta') || cleanQuery.includes('similar')) {
      const baseId = currentProductId || 'prod-kurti-black-wedding';
      const cheaperList = RecommendationService.getCheaperAlternatives(baseId, 3);
      return {
        reply: `💰 Bilkul! Yeh rahe similar design ke budget-friendly options jo kaafi affordable hain aur quality bhi solid hai:`,
        recommendedProducts: cheaperList,
      };
    }

    // Which one is better / comparison
    if (
      cleanQuery.includes('which one is better') ||
      cleanQuery.includes('kaunsa better hai') ||
      cleanQuery.includes('compare') ||
      cleanQuery.includes('dono me se')
    ) {
      const itemsToCompare = [db.products[0], db.products[1]];
      const comp = RecommendationService.compareProducts(itemsToCompare.map((p) => p.id));
      return {
        reply: `⚖️ **Comparison Result:**\n\n${comp.analysis}\n\nAap apni requirement aur budget ke hisab se choose kar sakte hain!`,
        recommendedProducts: comp.products,
      };
    }

    // Generic budget or category search
    const budgetMatch = cleanQuery.match(/under\s*(\d+)/i) || cleanQuery.match(/(\d+)\s*tak/i);
    const maxBudget = budgetMatch ? parseInt(budgetMatch[1], 10) : undefined;
    const matches = RecommendationService.searchByBudgetAndIntent(cleanQuery, maxBudget);

    if (matches.length > 0) {
      return {
        reply: `🛍️ Aapki pasand ke hisab se maine yeh best matching products dhoonde hain${
          maxBudget ? ` (under ₹${maxBudget})` : ''
        }:`,
        recommendedProducts: matches.slice(0, 3),
      };
    }

    // Default friendly assistant guidance
    return {
      reply: `Main aapki Shopzy shopping assistant hoon! Aap mujhse kuch bhi pooch sakte hain jaise:
• *"Mujhe wedding ke liye kurti chahiye under 800"*
• *"Show me something similar but cheaper"*
• *"Mera order kaha hai?"*
• *"Add the black one to my cart"*
• *"Which one is better?"*

Bataiye aaj aap kya dhoondh rahe hain? 😊`,
      recommendedProducts: db.products.slice(0, 3),
    };
  }
}
