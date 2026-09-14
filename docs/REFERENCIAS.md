# Referências e imagens — Filhas de Jó RJ

- Referência funcional: https://ceod2027.demolayrj.org/#inicio. Inspeção completa e capturas em 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932 e 390×844. Estrutura observada: navegação fixa, hero, congresso/local, tarifas, campanhas, apoiadores, inscrição e rodapé; fontes Manrope/Fraunces; azul, creme e dourado.
- Referência visual prioritária: print fornecido pelo usuário, `docs/reference/layout-fornecido.png`. Implementação mantém composição compacta e adapta para a logo oficial recebida. A navegação usa rótulos configuráveis, seções reordenáveis e visibilidade configurável.
- Logo oficial: arquivo PNG do usuário, copiado sem alteração para `public/assets/logo-filhas-de-jo-rj.png`. Não foi redesenhado, recortado ou recriado com IA.
- História: https://jobsdaughtersinternational.org/history/ e https://jobsdaughtersinternational.org/our-founder/ . Fundação em 1920, Ethel T. Wead Mick, Omaha, Nebraska e relação do nome com o Livro de Jó.
- Foto de Ethel: imagem publicada na página oficial da fundadora: https://jobsdaughtersinternational.org/wp-content/uploads/2016/07/18f35-f2743a_554b6dd911f24bebb25b8a36b0cf2483.gif . Fonte identificada; a página não informa uma licença aberta. A versão JPEG é apenas conversão de formato. A foto pode ser substituída pelo painel.
- Cenas atuais: cinco imagens originais geradas com a ferramenta integrada `image_gen`. São ilustrativas, identificadas como tal na galeria, e não são registros documentais de encontros da organização.

## Banners e prompts

1. `public/assets/hero-rio.webp`: wide 16:9 cinematic Rio sunset, Sugarloaf Mountain and Guanabara Bay; exactly four fictional young adult women viewed from behind, modest white dresses and flowing purple capes, grouped on right half; dark negative space on left for heading; deep plum #211126 and gold #D4AF37; no text, logo, emblems or ritual details.
2. `public/assets/rio-panorama.webp`: panoramic 21:9 photographic Rio sunset, Guanabara Bay, Sugarloaf and distant mountains, dark lower foreground, muted deep plum and warm gold, no people, no text or logos.
3. `public/assets/jovem-laco.webp`: 3:4 portrait of a fictional young adult woman from behind, long brown hair, white bow, modest white garment, purple shoulder fabric, soft outdoor tropical garden light in Rio, no logos or text.
4. `public/assets/flores.webp`: square realistic white and lavender flower bouquet on a warm wooden table, deep plum blurred background, elegant natural light, no ritual objects or logos.
5. `public/assets/amizade.webp`: square photograph of anatomically natural hands forming a heart silhouette, golden sunset inside the heart, Rio bay and Sugarloaf in background, no text or logos.

6. `public/assets/encontro-banner.webp`: novo banner exclusivo do encontro, solicitado após a primeira prévia. Imagem 3:1 de um terraço de evento fictício no Rio ao anoitecer, cadeiras brancas, arranjos roxos, luzes douradas discretas e espaço escuro à esquerda para o conteúdo. Gerada com `image_gen`; não representa local confirmado.

Os arquivos foram otimizados para WebP sem alteração da composição. A identidade combina #211126, #4B2E83, #6F3B91, #A78BCA, #D4AF37 e #F8F6F3; Cormorant Garamond, Inter e Mrs Saint Delafield.

## Verificação

Capturas completas do site e relatório em `docs/qa/` (não enviados à hospedagem). Sete larguras sem overflow ou imagens ausentes. Menu mobile, navegação por âncoras, galeria ampliada, teclado/Escape, validação de formulário, política de privacidade e bloqueio do painel sem autenticação verificados.
