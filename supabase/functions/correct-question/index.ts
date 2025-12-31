import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    
    if (!question || question.trim().length < 5) {
      return new Response(JSON.stringify({ 
        corrected: question,
        hasCorrections: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `أنت مصحح لغوي عربي متخصص. مهمتك هي:
1. تصحيح الأخطاء الإملائية والنحوية
2. تحسين صياغة السؤال ليكون أوضح
3. إضافة علامات الترقيم المناسبة
4. الحفاظ على المعنى الأصلي للسؤال

أجب فقط بالنص المصحح بدون أي شرح أو تعليق إضافي.
إذا كان النص صحيحاً تماماً، أعده كما هو.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const correctedText = data.choices?.[0]?.message?.content?.trim() || question;
    
    // Check if there are meaningful corrections
    const hasCorrections = correctedText.toLowerCase() !== question.toLowerCase() && 
                          correctedText.length > 0;

    return new Response(JSON.stringify({ 
      corrected: correctedText,
      original: question,
      hasCorrections 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in correct-question function:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      corrected: null,
      hasCorrections: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
