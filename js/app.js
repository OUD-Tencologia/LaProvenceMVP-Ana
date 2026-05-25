/* ================================================
   La Provence — Application Logic (localStorage MVP)
   ================================================ */

const CATALOG_VERSION = 9; // bump to force reset catalog for all users

/* ─── SEED DATA ─────────────────────────────────── */
const CATALOGO_SEED = [
  { id:'c1',  nome:'Conj. 6 Taças Crystal Glass', marca:'Bohemia', tamanho:'300ml', quantidade:1, descricao:'Conjunto com 6 taças em cristal lapidado Bohemia. Elegância e sofisticação para a mesa.', preco:1303.50, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6298.jpg'], version:1 },
  { id:'c2',  nome:'Conj. 6 Copos Azul Lapidado em Vidro', marca:'La Provence Decor', tamanho:'400ml', quantidade:1, descricao:'Conjunto com 6 copos em vidro azul lapidado, exclusivos La Provence Decor.', preco:585.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6317.jpg'], version:1 },
  { id:'c3',  nome:'Jarra em Vidro Pétalas La Provence', marca:'Fracalanza', tamanho:'1,8L', quantidade:1, descricao:'Jarra em vidro com design Pétalas, exclusividade La Provence Decor.', preco:359.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6323.jpg'], version:1 },
  { id:'c4',  nome:'Conj. 4 Copos em Vidro Pétalas', marca:'Fracalanza', tamanho:'480ml', quantidade:1, descricao:'Conjunto com 4 copos em vidro Pétalas La Provence Decor.', preco:489.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6323.jpg'], version:1 },
  { id:'c5',  nome:'Conj. 6 Copos Verde Lapidado em Vidro', marca:'La Provence Decor', tamanho:'400ml', quantidade:1, descricao:'Conjunto com 6 copos em vidro verde lapidado, exclusivos La Provence Decor.', preco:585.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6347.jpg'], version:1 },
  { id:'c6',  nome:'Conj. 6 Taças Cristal para Água Verde Lapidada', marca:'Bohemia', tamanho:'300ml', quantidade:1, descricao:'Conjunto com 6 taças de cristal para água em verde lapidado, Bohemia.', preco:610.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6353.jpg'], version:1 },
  { id:'c7',  nome:'Jarra em Vidro Borosil', marca:'Fracalanza', tamanho:'1,2L', quantidade:1, descricao:'Jarra em vidro borosilicato resistente a variações de temperatura.', preco:175.00, setor:'Mesa posta', estoque:15, status:'Ativo', imgs:['assets/img/catalog/IMG_6364.jpg'], version:1 },
  { id:'c8',  nome:'Jarra em Vidro Pétalas Verde', marca:'Fracalanza', tamanho:'1,8L', quantidade:1, descricao:'Jarra em vidro com design Pétalas na versão verde, exclusividade La Provence.', preco:359.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6363.jpg'], version:1 },
  { id:'c9',  nome:'Jogo 2 Taças para Vinho Pétalas Verde', marca:'Fracalanza', tamanho:'500ml', quantidade:1, descricao:'Par de taças para vinho no design Pétalas Verde, Fracalanza.', preco:300.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6363.jpg'], version:1 },
  { id:'c10', nome:'Centro de Mesa em Cristal', marca:'Bohemia', tamanho:'', quantidade:1, descricao:'Centro de mesa em cristal Bohemia, peça de destaque para sua mesa posta.', preco:990.00, setor:'Adornos', estoque:5,  status:'Ativo', imgs:['assets/img/catalog/IMG_6463.jpg'], version:1 },
  { id:'c11', nome:'Decanter em Vidro Sodoca', marca:'Wolff', tamanho:'1,5L', quantidade:1, descricao:'Decanter em vidro para aeração e apresentação de vinhos.', preco:125.00, setor:'Mesa posta', estoque:12, status:'Ativo', imgs:['assets/img/catalog/IMG_6457.jpg','assets/img/catalog/IMG_29.jpg'], version:1 },
  { id:'c12', nome:'Conj. Saleiro e Pimenteira em Cristal Chumbo', marca:'Bohemia', tamanho:'', quantidade:1, descricao:'Conjunto com 1 saleiro e 1 pimenteira em cristal de chumbo Bohemia.', preco:167.00, setor:'Mesa posta', estoque:12, status:'Ativo', imgs:['assets/img/catalog/IMG_6472.jpg'], version:1 },
  { id:'c13', nome:'Porta Doces com Pé e Cúpula em Vidro', marca:'Studio Collection', tamanho:'14x17cm', quantidade:1, descricao:'Porta doces com pé e cúpula em vidro, elegante para sobremesas e bolos.', preco:156.00, setor:'Adornos', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6476.jpg'], version:1 },
  { id:'c14', nome:'Conj. 4 Pratos Rasos Aves', marca:'Maison Blanche', tamanho:'27cm', quantidade:1, descricao:'Conjunto com 4 pratos rasos com estampa de aves, Maison Blanche.', preco:810.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6481.jpg'], version:1 },
  { id:'c15', nome:'Conj. 4 Pratos Sobremesa Aves', marca:'Maison Blanche', tamanho:'20cm', quantidade:1, descricao:'Conjunto com 4 pratos de sobremesa com estampa de aves, Maison Blanche.', preco:695.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6481.jpg'], version:1 },
  { id:'c16', nome:'Jarra Itacaré em Cerâmica Linha Coco', marca:'Maison Blanche', tamanho:'1L', quantidade:1, descricao:'Jarra em cerâmica da linha Coco Itacaré, Maison Blanche. Charme rústico e sofisticado.', preco:389.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6486.jpg'], version:1 },
  { id:'c17', nome:'Conj. 6 Pratos Fundos Borboletas em Cerâmica', marca:'Concept Scala', tamanho:'21,5cm', quantidade:1, descricao:'Conjunto com 6 pratos fundos em cerâmica com estampa de borboletas.', preco:290.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6501.jpg'], version:1 },
  { id:'c18', nome:'Conj. 6 Pratos Rasos Borboletas em Cerâmica', marca:'Concept Scala', tamanho:'27,5cm', quantidade:1, descricao:'Conjunto com 6 pratos rasos em cerâmica com estampa de borboletas.', preco:350.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6501.jpg'], version:1 },
  { id:'c19', nome:'Conj. 6 Xícaras com Pires Borboletas em Cerâmica', marca:'Concept Scala', tamanho:'300ml', quantidade:1, descricao:'Conjunto com 6 xícaras e pires em cerâmica com estampa de borboletas.', preco:360.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6501.jpg'], version:1 },
  { id:'c20', nome:'Travessa Grande Folha em Porcelana Sommelier', marca:'Scala', tamanho:'35cm', quantidade:1, descricao:'Travessa grande no formato folha em porcelana Sommelier.', preco:188.85, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_6511.jpg'], version:1 },
  { id:'c21', nome:'Fruteira Média Folha Verde Alta em Porcelana', marca:'Scala', tamanho:'33,5cm', quantidade:1, descricao:'Fruteira média no formato folha verde com pé alto em porcelana.', preco:280.00, setor:'Adornos', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6512.jpg'], version:1 },
  { id:'c22', nome:'Fruteira Média Folha Rasa em Porcelana', marca:'Scala', tamanho:'33,5cm', quantidade:1, descricao:'Fruteira média no formato folha rasa em porcelana.', preco:200.00, setor:'Adornos', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6509.jpg'], version:1 },
  { id:'c23', nome:'Conj. 36 Peças Jantar Porcelana Fanci Menta', marca:'Wolff', tamanho:'36 peças', quantidade:1, descricao:'Aparelho de jantar completo com 36 peças em porcelana Fanci Menta.', preco:2700.00, setor:'Mesa posta', estoque:5,  status:'Ativo', imgs:['assets/img/catalog/IMG_6671.jpg'], version:1 },
  { id:'c24', nome:'Réchaud Redondo em Cerâmica com Queimador Cobre', marca:'Wolff', tamanho:'640g', quantidade:1, descricao:'Réchaud redondo em cerâmica com queimador em cobre.', preco:780.30, setor:'Prataria', estoque:6,  status:'Ativo', imgs:['assets/img/catalog/IMG_6678.jpg'], version:1 },
  { id:'c25', nome:'Aparelho de Fondue 8 Peças em Porcelana', marca:'Fracalanza', tamanho:'300ml', quantidade:1, descricao:'Aparelho de fondue com 8 peças em porcelana e base de bambu com queimador.', preco:220.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6683.jpg'], version:1 },
  { id:'c26', nome:'Conj. de Jantar com 24 Peças em Cerâmica', marca:"L'Hermitage", tamanho:'24 peças', quantidade:1, descricao:"Aparelho de jantar com 24 peças em cerâmica L'Hermitage.", preco:1867.00, setor:'Mesa posta', estoque:5,  status:'Ativo', imgs:['assets/img/catalog/IMG_6691.jpg'], version:1 },
  { id:'c27', nome:'Jogo para Sobremesa com 7 Peças em Vidro', marca:"L'Hermitage", tamanho:'1,86L', quantidade:1, descricao:"Jogo para sobremesa com 7 peças em vidro L'Hermitage.", preco:279.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6702.jpg'], version:1 },
  { id:'c28', nome:'Conj. 6 Copos Abacaxi em Cerâmica Linha Mauí', marca:'Scala', tamanho:'', quantidade:1, descricao:'Conjunto com 6 copos abacaxi em cerâmica da linha Mauí.', preco:386.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6741.jpg'], version:1 },
  { id:'c29', nome:'Jarra em Cerâmica Marmorizada', marca:'La Provence Decor', tamanho:'2,0L', quantidade:1, descricao:'Jarra em cerâmica com efeito marmorizado, exclusividade La Provence Decor.', preco:270.00, setor:'Vasos', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_6751.jpg'], version:1 },
  { id:'c30', nome:'Jogo de Jantar 20 Peças em Cristal', marca:'Wolff', tamanho:'20 peças', quantidade:1, descricao:'Jogo de jantar completo com 20 peças em cristal.', preco:950.00, setor:'Mesa posta', estoque:6,  status:'Ativo', imgs:['assets/img/catalog/IMG_77.jpg'], version:1 },
  { id:'c31', nome:'Sopeira Porcelana Limoges Vendages', marca:'Wolff', tamanho:'4,0L', quantidade:1, descricao:'Sopeira em porcelana Limoges Vendages, clássica e refinada.', preco:860.00, setor:'Mesa posta', estoque:6,  status:'Ativo', imgs:['assets/img/catalog/IMG_02.jpg','assets/img/catalog/IMG_75.jpg','assets/img/catalog/IMG_76.jpg'], version:1 },
  { id:'c32', nome:'Conj. 6 Potes de Vidro Borosilicato com Tampa Hermética', marca:'Wolff', tamanho:'120ml', quantidade:1, descricao:'Conjunto com 6 potes em vidro borosilicato com tampa hermética.', preco:210.00, setor:'Complementos', estoque:12, status:'Ativo', imgs:['assets/img/catalog/IMG_74.jpg','assets/img/catalog/IMG_05.jpg'], version:1 },
  { id:'c33', nome:'Conj. 12 Potes de Vidro Borosilicato Giratório', marca:'Wolff', tamanho:'120ml', quantidade:1, descricao:'Conjunto giratório com 12 potes em vidro borosilicato com tampa hermética.', preco:499.90, setor:'Complementos', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_33.jpg','assets/img/catalog/IMG_34.jpg','assets/img/catalog/IMG_35.jpg'], version:1 },
  { id:'c34', nome:'Jogo de 14 Peças para Chá Scarlate em Porcelana', marca:"L'Hermitage", tamanho:'Bule 1L / Xícaras 350ml', quantidade:1, descricao:"Jogo completo para chá com 14 peças Scarlate em porcelana L'Hermitage.", preco:1424.00, setor:'Mesa posta', estoque:5,  status:'Ativo', imgs:['assets/img/catalog/IMG_65.jpg','assets/img/catalog/IMG_71.jpg','assets/img/catalog/IMG_72.jpg','assets/img/catalog/IMG_73.jpg'], version:1 },
  { id:'c35', nome:'Conj. 2 Tábuas de Madeira com Mármore', marca:'Wolff', tamanho:'', quantidade:1, descricao:'Conjunto com 2 tábuas em madeira com mármore, perfeitas para queijos e frios.', preco:650.00, setor:'Complementos', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_67.jpg','assets/img/catalog/IMG_68.jpg','assets/img/catalog/IMG_69.jpg','assets/img/catalog/IMG_70.jpg'], version:1 },
  { id:'c36', nome:'Conj. 6 Xícaras Chá Porcelana com Pires Birds Branco', marca:'Wolff', tamanho:'200ml', quantidade:1, descricao:'Conjunto com 6 xícaras de chá em porcelana com pires na coleção Birds Branco.', preco:570.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_57.jpg','assets/img/catalog/IMG_58.jpg','assets/img/catalog/IMG_59.jpg'], version:1 },
  { id:'c37', nome:'Jarro de Cerâmica Decorativo', marca:'La Provence Decor', tamanho:'1L', quantidade:1, descricao:'Jarro de cerâmica decorativo exclusivo La Provence Decor, toque refinado ao ambiente.', preco:449.90, setor:'Vasos', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_63.jpg','assets/img/catalog/IMG_66.jpg'], version:1 },
  { id:'c38', nome:'Xícara com Pires de Cerâmica Decorativa', marca:'La Provence Decor', tamanho:'200ml', quantidade:1, descricao:'Xícara com pires em cerâmica decorativa, peça especial La Provence Decor.', preco:200.00, setor:'Adornos', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_61.jpg','assets/img/catalog/IMG_64.jpg'], version:1 },
  { id:'c39', nome:'Prato para Bolo com Espátula em Porcelana', marca:"L'Hermitage", tamanho:'', quantidade:1, descricao:"Prato para bolo acompanhado de espátula em porcelana L'Hermitage.", preco:410.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_60.jpg','assets/img/catalog/IMG_62.jpg'], version:1 },
  { id:'c40', nome:'Conj. 6 Xícaras para Café Porcelana Limoges Vendages', marca:'Wolff', tamanho:'100ml', quantidade:1, descricao:'Conjunto com 6 xícaras para café em porcelana Limoges Vendages.', preco:579.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_55.jpg','assets/img/catalog/IMG_75.jpg','assets/img/catalog/IMG_76.jpg'], version:1 },
  { id:'c41', nome:'Molheira Porcelana Limoges Vendages', marca:'Wolff', tamanho:'500ml', quantidade:1, descricao:'Molheira em porcelana Limoges Vendages, sofisticada para o serviço à mesa.', preco:140.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_54.jpg','assets/img/catalog/IMG_75.jpg','assets/img/catalog/IMG_76.jpg'], version:1 },
  { id:'c42', nome:'Leiteira Porcelana Limoges Vendages', marca:'Wolff', tamanho:'120ml', quantidade:1, descricao:'Leiteira em porcelana Limoges Vendages, peça clássica da coleção.', preco:220.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_75.jpg','assets/img/catalog/IMG_76.jpg','assets/img/catalog/IMG_53.jpg'], version:1 },
  { id:'c43', nome:'Garrafa Térmica em Inox com Ratan', marca:'Wolff', tamanho:'1,5L', quantidade:1, descricao:'Garrafa térmica em inox com acabamento em ratan, elegância e funcionalidade.', preco:460.00, setor:'Complementos', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_51.jpg'], version:1 },
  { id:'c44', nome:'Garrafa Térmica Verde com Cabo de Madeira', marca:'Wolff', tamanho:'1,0L', quantidade:1, descricao:'Garrafa térmica verde em plástico com cabo de madeira.', preco:159.90, setor:'Complementos', estoque:12, status:'Ativo', imgs:['assets/img/catalog/IMG_46.jpg','assets/img/catalog/IMG_47.jpg','assets/img/catalog/IMG_48.jpg'], version:1 },
  { id:'c45', nome:'Garrafa Térmica Branca com Cabo de Madeira', marca:'Incasa', tamanho:'1,0L', quantidade:1, descricao:'Garrafa térmica branca em plástico com cabo de madeira.', preco:150.00, setor:'Complementos', estoque:12, status:'Ativo', imgs:['assets/img/catalog/IMG_38.jpg','assets/img/catalog/IMG_49.jpg','assets/img/catalog/IMG_50.jpg'], version:1 },
  { id:'c46', nome:'Garrafa Térmica Preta com Cabo de Madeira', marca:'Incasa', tamanho:'1,0L', quantidade:1, descricao:'Garrafa térmica preta em plástico com cabo de madeira.', preco:150.00, setor:'Complementos', estoque:12, status:'Ativo', imgs:['assets/img/catalog/IMG_42.jpg','assets/img/catalog/IMG_43.jpg','assets/img/catalog/IMG_44.jpg','assets/img/catalog/IMG_45.jpg'], version:1 },
  { id:'c47', nome:'Mantegueira Vidro Base Bambu Bird com Tampa', marca:'Wolff', tamanho:'', quantidade:1, descricao:'Mantegueira em vidro com base de bambu Bird e tampa.', preco:79.90,  setor:'Mesa posta', estoque:12, status:'Ativo', imgs:['assets/img/catalog/IMG_40.jpg','assets/img/catalog/IMG_41.jpg'], version:1 },
  { id:'c48', nome:'Queijeira Vidro Base Bambu Bird com Tampa', marca:'Wolff', tamanho:'', quantidade:1, descricao:'Queijeira em vidro com base de bambu Bird e tampa elegante.', preco:165.00, setor:'Mesa posta', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_40.jpg'], version:1 },
  { id:'c49', nome:'Prato Cristal de Chumbo com Pé e Tampa', marca:'Wolff', tamanho:'', quantidade:1, descricao:'Prato em cristal de chumbo com pé e tampa, peça de destaque para a mesa.', preco:180.00, setor:'Prataria', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_39.jpg'], version:1 },
  { id:'c50', nome:'Prato para Bolo de Vidro com Pé e Tampa', marca:'Wolff', tamanho:'', quantidade:1, descricao:'Prato para bolo em vidro com pé e tampa de vidro.', preco:390.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_36.jpg','assets/img/catalog/IMG_37.jpg'], version:1 },
  { id:'c51', nome:'Travessa Oval Vimini em Vidro com Suporte Rattan', marca:'Wolff', tamanho:'2,4L', quantidade:1, descricao:'Travessa oval em vidro borosilicato com suporte em rattan Vimini.', preco:269.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_32.jpg'], version:1 },
  { id:'c52', nome:'Travessa Retangular em Vidro com Suporte Rattan', marca:'Wolff', tamanho:'3,8L', quantidade:1, descricao:'Travessa retangular em vidro borosilicato com suporte em rattan.', preco:250.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_31.jpg'], version:1 },
  { id:'c53', nome:'Garrafa Térmica em Prata Sheffield', marca:'Sheffield Plate', tamanho:'1,5L', quantidade:1, descricao:'Garrafa térmica em prata Sheffield Plate, peça de colecionador.', preco:5393.00, setor:'Prataria', estoque:3,  status:'Ativo', imgs:['assets/img/catalog/IMG_28.jpg'], version:1 },
  { id:'c54', nome:'Boleira com Cúpula em Vidro e Base em Mármore', marca:'BTC', tamanho:'', quantidade:1, descricao:'Boleira com cúpula de vidro e base em mármore, sofisticação para a mesa de doces.', preco:940.00, setor:'Adornos', estoque:5,  status:'Ativo', imgs:['assets/img/catalog/IMG_26.jpg'], version:1 },
  { id:'c55', nome:'Balde de Gelo Liso em Prata Montpellier', marca:'Montpellier', tamanho:'2,75L', quantidade:1, descricao:'Balde de gelo liso em prata Montpellier, item de luxo para recepções.', preco:3312.00, setor:'Prataria', estoque:3,  status:'Ativo', imgs:['assets/img/catalog/IMG_25.jpg'], version:1 },
  { id:'c56', nome:'Balde de Gelo em Inox', marca:'', tamanho:'4,0L', quantidade:1, descricao:'Balde de gelo em aço inoxidável, funcional e elegante.', preco:351.00, setor:'Prataria', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_19.jpg'], version:1 },
  { id:'c57', nome:'Balde para Champanhe Dourado/Preto Relevo', marca:'', tamanho:'5,0L', quantidade:1, descricao:'Balde para champanhe com acabamento dourado e preto em relevo.', preco:450.00, setor:'Prataria', estoque:6,  status:'Ativo', imgs:['assets/img/catalog/IMG_18.jpg'], version:1 },
  { id:'c58', nome:'Jarra em Vidro Transparente Ponto Dourado', marca:'BTC', tamanho:'', quantidade:1, descricao:'Jarra em vidro transparente com delicado ponto dourado, coleção BTC.', preco:350.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_23.jpg'], version:1 },
  { id:'c59', nome:'Conj. 6 Taças Vidro Transparente Ponto Dourado', marca:'BTC', tamanho:'320ml', quantidade:1, descricao:'Conjunto com 6 taças em vidro transparente com ponto dourado, coleção BTC.', preco:660.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_27.jpg'], version:1 },
  { id:'c60', nome:'Conj. 6 Copos Vidro Textura Burbujas Âmbar', marca:'BTC', tamanho:'350ml', quantidade:1, descricao:'Conjunto com 6 copos em vidro com textura Burbujas na cor âmbar.', preco:449.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_22.jpg'], version:1 },
  { id:'c61', nome:'Conj. 6 Copos em Vidro Colorido', marca:'BTC', tamanho:'340ml', quantidade:1, descricao:'Conjunto com 6 copos em vidro colorido, alegria e cor para a mesa.', preco:669.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_21.jpg'], version:1 },
  { id:'c62', nome:'Réchaud em Prata com Marinex Retangular', marca:'Apolo', tamanho:'3L', quantidade:1, descricao:'Réchaud em prata com cuba Marinex retangular, perfeito para recepções elegantes.', preco:4260.00, setor:'Prataria', estoque:3,  status:'Ativo', imgs:['assets/img/catalog/IMG_16.jpg','assets/img/catalog/IMG_78.jpg'], version:1 },
  { id:'c63', nome:'Bandeja de Mármore e Metal Gold', marca:'', tamanho:'', quantidade:1, descricao:'Bandeja exclusiva em mármore com alças de metal dourado.', preco:1879.90, setor:'Prataria', estoque:5,  status:'Ativo', imgs:['assets/img/catalog/IMG_15.jpg','assets/img/catalog/IMG_16.jpg'], version:1 },
  { id:'c64', nome:'Aparelho de Jantar 42 Peças Porcelana Nice Silver', marca:'Wolff', tamanho:'42 peças', quantidade:1, descricao:'Aparelho de jantar completo com 42 peças em porcelana Nice Silver Wolf.', preco:2353.00, setor:'Mesa posta', estoque:4,  status:'Ativo', imgs:['assets/img/catalog/IMG_79.jpg'], version:1 },
  { id:'c65', nome:'Kit Lavabo 4 Peças em Porcelana', marca:'BTC', tamanho:'', quantidade:1, descricao:'Kit lavabo completo com 4 peças em porcelana BTC.', preco:310.00, setor:'Adornos', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_24.jpg'], version:1 },
  { id:'c66', nome:'Kit Lavabo 4 Peças em Vidro', marca:'La Provence Decor', tamanho:'', quantidade:1, descricao:'Kit lavabo exclusivo com 4 peças em vidro La Provence Decor.', preco:635.00, setor:'Adornos', estoque:6,  status:'Ativo', imgs:['assets/img/catalog/IMG_17.jpg'], version:1 },
  { id:'c67', nome:'Kit Lavabo 3 Peças Lyra Aquamarine', marca:'Aquamarine', tamanho:'', quantidade:1, descricao:'Kit lavabo Lyra com porta sabonete líquido, porta cotonete/algodão e porta escovas.', preco:2580.00, setor:'Adornos', estoque:4,  status:'Ativo', imgs:['assets/img/catalog/IMG_30.jpg'], version:1 },
  { id:'c68', nome:'Bandeja para Lavabo Lyra Aquamarine', marca:'Aquamarine', tamanho:'', quantidade:1, descricao:'Bandeja complementar para lavabo da linha Lyra Aquamarine.', preco:989.00, setor:'Adornos', estoque:5,  status:'Ativo', imgs:['assets/img/catalog/IMG_30.jpg'], version:1 },
  { id:'c69', nome:'Jogo com 4 Facas para Queijo', marca:'Mabruk', tamanho:'', quantidade:1, descricao:'Jogo com 4 facas especiais para queijo.', preco:369.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_08.jpg'], version:1 },
  { id:'c70', nome:'Jogo de 6 Peças para Servir London', marca:'Wolff', tamanho:'', quantidade:1, descricao:'Jogo completo com 6 peças para servir, coleção London Wolff.', preco:652.55, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_06.jpg','assets/img/catalog/IMG_07.jpg'], version:1 },
  { id:'c71', nome:'Capa para Almofada Poliéster — Verde/Floral', marca:'La Provence Decor', tamanho:'42x42cm', quantidade:1, descricao:'Capa para almofada em 100% poliéster com estampa verde/floral.', preco:175.00, setor:'Adornos', estoque:15, status:'Ativo', imgs:['assets/img/catalog/IMG_10.jpg','assets/img/catalog/IMG_11.jpg','assets/img/catalog/IMG_12.jpg'], version:1 },
  { id:'c72', nome:'Capa para Almofada Poliéster — Neutra', marca:'La Provence Decor', tamanho:'42x42cm', quantidade:1, descricao:'Capa para almofada em 100% poliéster em tom neutro e delicado.', preco:149.90, setor:'Adornos', estoque:15, status:'Ativo', imgs:['assets/img/catalog/IMG_13.jpg'], version:1 },
  { id:'c73', nome:'Capa para Almofada Poliéster — Floral', marca:'Mabruk', tamanho:'40x40cm', quantidade:1, descricao:'Capa para almofada em 100% poliéster com estampa floral delicada.', preco:150.00, setor:'Adornos', estoque:15, status:'Ativo', imgs:['assets/img/catalog/IMG_09.jpg'], version:1 },
  { id:'c74', nome:'Conj. 4 Canecas com Pires em Madeira Cinza', marca:'Woodart', tamanho:'115ml', quantidade:1, descricao:'Conjunto com 4 canecas e pires em madeira cinza, rústico e charmoso.', preco:280.00, setor:'Mesa posta', estoque:8,  status:'Ativo', imgs:['assets/img/catalog/IMG_129.jpg','assets/img/catalog/IMG_139.jpg'], version:1 },
  { id:'c75', nome:'Cesta em Fibra Natural Retangular', marca:'La Provence Decor', tamanho:'40x19x8cm', quantidade:1, descricao:'Cesta retangular em fibra natural, versátil e com charme provençal.', preco:285.00, setor:'Complementos', estoque:10, status:'Ativo', imgs:['assets/img/catalog/IMG_80.jpg','assets/img/catalog/IMG_81.jpg','assets/img/catalog/IMG_82.jpg','assets/img/catalog/IMG_83.jpg'], version:1 },
];

const PREMONTADAS_SEED = [
  {
    id: 'p1',
    nome: 'Clássica',
    descricao: 'O essencial clássico para receber com elegância. Porcelana refinada, cristais lapidados e peças atemporais que tornarão cada reunião inesquecível.',
    itens: ['c1', 'c6', 'c14', 'c15', 'c20', 'c31', 'c40', 'c41', 'c42', 'c64'],
    badge: 'Atemporal',
    img: 'assets/img/dishesTemplate7.png'
  },
  {
    id: 'p2',
    nome: 'Rústica',
    descricao: 'Cerâmicas únicas, madeiras naturais e texturas que trazem calor e autenticidade ao lar. Para quem ama um estilo aconchegante e original.',
    itens: ['c16', 'c17', 'c18', 'c19', 'c28', 'c29', 'c35', 'c37', 'c74', 'c75', 'c71', 'c73'],
    badge: 'Mais Popular',
    popular: true,
    img: 'assets/img/dishesTemplate1.png'
  },
  {
    id: 'p3',
    nome: 'Minimalista',
    descricao: 'Linhas limpas, formas puras e sofisticação discreta. Para quem valoriza o essencial com muita qualidade e design contemporâneo.',
    itens: ['c11', 'c32', 'c33', 'c43', 'c50', 'c51', 'c54', 'c58', 'c59', 'c61'],
    badge: 'Premium',
    img: 'assets/img/dishesTemplate6.png'
  }
];

/* ─── STORAGE HELPERS ──────────────────────────── */
const Store = {
  get: (key) => { try { return JSON.parse(localStorage.getItem('lp_' + key)) || null; } catch { return null; } },
  set: (key, val) => localStorage.setItem('lp_' + key, JSON.stringify(val)),
  remove: (key) => localStorage.removeItem('lp_' + key),
};

const LEGACY_GESTOR_PASSWORD = window.LA_PROVENCE_LEGACY_GESTOR_PASSWORD || null;

function init() {
  // Force-reset catalog when version changes
  if (Store.get('catalogoVersion') !== CATALOG_VERSION) {
    // Mapeamento específico dos itens com suas versões de uso
    const specificMappings = {
      'c1': ['assets/img/catalog/ListaItens/Conj6TacasCrystalGlass1.JPG', 'assets/img/catalog/ListaItens/Conj6TacasCrystalGlassUsing.png'],
      'c4': ['assets/img/catalog/ListaItens/Conj4CoposVidroPetalas1.JPG', 'assets/img/catalog/ListaItens/Conj4CoposVidroPetalas1Using.png'],
      'c5': ['assets/img/catalog/ListaItens/Conj6CoposVerdeLapidado1.jpg', 'assets/img/catalog/ListaItens/Conj6CoposVerdeLapidado1Using.png'],
      'c6': ['assets/img/catalog/ListaItens/Conj6TacasCristalAgua1.JPG', 'assets/img/catalog/ListaItens/Conj6TacasCristalAguaUsing.png'],
      'c7': ['assets/img/catalog/ListaItens/JarraVidroBorosil1.JPG', 'assets/img/catalog/ListaItens/JarraVidroBorosilUsing.png'],
      'c9': ['assets/img/catalog/ListaItens/Jogo2TacasVinhoVidro1.JPG', 'assets/img/catalog/ListaItens/Jogo2TacasVinhoVidroUsing.png'],
      'c10': ['assets/img/catalog/ListaItens/CentroMesaCristal1.JPG', 'assets/img/catalog/ListaItens/CentroMesaCristalUsing.png'],
      'c11': ['assets/img/catalog/ListaItens/DecanterVidroSodoca1.JPG', 'assets/img/catalog/ListaItens/DecanterVidroSodoca2.jpeg', 'assets/img/catalog/ListaItens/DecanterVidroSodocaUsing.png'],
      'c12': ['assets/img/catalog/ListaItens/Conj1Saleiro1Pimenteira1.JPG', 'assets/img/catalog/ListaItens/Conj1Saleiro1PimenteiraUsing.png'],
      'c13': ['assets/img/catalog/ListaItens/PortaDocesPeCupulaVidro1.JPG', 'assets/img/catalog/ListaItens/PortaDocesPeCupulaVidroUsing.png'],
      'c14': ['assets/img/catalog/ListaItens/Conj4PratosRasosAves1.JPG', 'assets/img/catalog/ListaItens/Conj4PratosRasosAves2.JPG', 'assets/img/catalog/ListaItens/Conj4PratosRasosAvesUsing.png'],
      'c15': ['assets/img/catalog/ListaItens/PRATO SOBREMESA - MAISON BLANCHE AVES.jpg'],
      'c16': ['assets/img/catalog/ListaItens/JarraItacareCeramicaLinhaCoco1.JPG', 'assets/img/catalog/ListaItens/JarraItacareCeramicaLinhaCocoUsing.png'],
      'c17': ['assets/img/catalog/ListaItens/Conj6PratosFundosBorboletas1.JPG', 'assets/img/catalog/ListaItens/Conj6PratosFundosBorboletasUsing.png'],
      'c20': ['assets/img/catalog/ListaItens/TravessaGrandeFolhaPorcelanaSommelier1.JPG', 'assets/img/catalog/ListaItens/TravessaGrandeFolhaPorcelanaSommelierUsing.png'],
      'c21': ['assets/img/catalog/ListaItens/FruteiraMediaFolhaVerdeAlta1.JPG', 'assets/img/catalog/ListaItens/FruteiraMediaFolhaVerdeAltaUsing.png'],
      'c22': ['assets/img/catalog/ListaItens/FruteiraMediaFolhaRasaPorcelana1.JPG', 'assets/img/catalog/ListaItens/FruteiraMediaFolhaRasaPorcelanaUsing.png']
    };

    const catalogoComFotos = CATALOGO_SEED.map((item, index) => {
      let imgs = [];
      
      if (specificMappings[item.id]) {
        imgs = [...specificMappings[item.id]];
      } else {
        // Reajusta os caminhos antigos para a pasta ListaItensSemNome com os nomes certinhos
        (item.imgs || []).forEach(img => {
          let updatedImg = img.replace('assets/img/catalog/', 'assets/img/catalog/ListaItens/ListaItensSemNome/');
          const match = updatedImg.match(/IMG_(\d+)\.(jpg|jpeg|png)$/i);
          if (match) {
            const num = match[1];
            if (num.length <= 3) {
              updatedImg = updatedImg.replace(/IMG_(\d+)\.(jpg|jpeg|png)$/i, 'IMG$1.jpeg');
            } else {
              updatedImg = updatedImg.replace(/\.(jpg|jpeg|png)$/i, '.JPG');
            }
          }
          imgs.push(updatedImg);
        });
      }

      return { ...item, imgs };
    });

    Store.set('catalogo', catalogoComFotos);
    Store.set('catalogoVersion', CATALOG_VERSION);
    
    // RESET: Excluir todos os usuários (exceto gestor) e limpar dados de testes (listas/compras)
    Store.set('usuarios', [
      { id: 'gestor-01', nome: 'Gestor La Provence', email: 'gestor@laprovence.com', senha: LEGACY_GESTOR_PASSWORD, role: 'gestor', telefone: '' }
    ]);
    Store.set('listas', []);
    Store.set('compras', []);
  }
  // Always refresh premontadas seed
  Store.set('premontadas', PREMONTADAS_SEED);
  if (!Store.get('usuarios')) Store.set('usuarios', [
    { id: 'gestor-01', nome: 'Gestor La Provence', email: 'gestor@laprovence.com', senha: LEGACY_GESTOR_PASSWORD, role: 'gestor', telefone: '' }
  ]);
  if (!Store.get('listas')) Store.set('listas', []);
  if (!Store.get('compras')) Store.set('compras', []);
}

/* ─── AUTH ─────────────────────────────────────── */
function getCurrentUser() { return Store.get('currentUser'); }
function setCurrentUser(u) { Store.set('currentUser', u); }
function logout() { Store.remove('currentUser'); window.location.href = 'auth.html'; }

function requireAuth(role) {
  const u = getCurrentUser();
  if (!u) { window.location.href = 'auth.html'; return null; }
  if (role && u.role !== role) { window.location.href = u.role === 'gestor' ? 'gestor.html' : 'dashboard.html'; return null; }
  return u;
}

function login(email, senha) {
  const usuarios = Store.get('usuarios') || [];
  const user = usuarios.find(u => u.email === email && u.senha && u.senha === senha);
  if (!user) throw new Error('E-mail ou senha incorretos.');
  setCurrentUser(user);
  return user;
}

function register(nome, email, senha, telefone) {
  const usuarios = Store.get('usuarios') || [];
  if (usuarios.find(u => u.email === email)) throw new Error('Este e-mail já está cadastrado.');
  const user = {
    id: 'u_' + Date.now(),
    nome, email, senha, telefone,
    role: 'noivo'
  };
  usuarios.push(user);
  Store.set('usuarios', usuarios);
  setCurrentUser(user);
  return user;
}

/* ─── LISTAS ────────────────────────────────────── */
function getListas() { return Store.get('listas') || []; }
function saveListas(l) { Store.set('listas', l); }

function getListaByUser(userId) {
  return getListas().find(l => l.user_id === userId && l.status === 'Ativa');
}

function getListaByCodigo(codigo) {
  return getListas().find(l => l.codigo === codigo.toUpperCase() && l.status === 'Ativa');
}

function criarLista(userId, nomeNoivos, telefone, dataCasamento, itens = [], fotoCasal = null) {
  const listas = getListas();
  const existente = listas.find(l => l.user_id === userId && l.status === 'Ativa');
  if (existente) return existente;

  const codigo = gerarCodigo();
  const lista = {
    id: 'l_' + Date.now(),
    codigo,
    nome_noivos: nomeNoivos,
    telefone,
    data_casamento: dataCasamento,
    foto_casal: fotoCasal,
    status: 'Ativa',
    user_id: userId,
    itens: itens,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  listas.push(lista);
  saveListas(listas);
  return lista;
}

function atualizarListaItens(listaId, itens) {
  const listas = getListas();
  const idx = listas.findIndex(l => l.id === listaId);
  if (idx === -1) return;
  listas[idx].itens = itens;
  listas[idx].updated_at = new Date().toISOString();
  saveListas(listas);
}

function salvarMensagemLista(listaId, mensagem) {
  const listas = getListas();
  const idx = listas.findIndex(l => l.id === listaId);
  if (idx !== -1) {
    listas[idx].mensagem_boas_vindas = mensagem;
    saveListas(listas);
  }
}

function gerarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

/* ─── COMPRAS ───────────────────────────────────── */
function getCompras() { return Store.get('compras') || []; }
function getComprasByLista(listaId) { return getCompras().filter(c => c.lista_id === listaId); }
function getComprasByItem(listaId, itemId) { return getCompras().find(c => c.lista_id === listaId && c.item_id === itemId); }

function registrarCompra(listaId, itemId, dados) {
  if (getComprasByItem(listaId, itemId)) throw new Error('Este item já foi presenteado por outro convidado.');

  const compras = getCompras();
  const compra = {
    id: 'comp_' + Date.now(),
    lista_id: listaId,
    item_id: itemId,
    nome_convidado: dados.nome,
    cpf: dados.cpf,
    telefone: dados.telefone,
    valor_pago: dados.valor,
    forma_pagamento: dados.pagamento,
    status_pagamento: 'Pendente',
    data_compra: new Date().toISOString(),
    created_at: new Date().toISOString(),
    is_new_gestor: true,
    is_new_noivo: false
  };
  compras.push(compra);
  Store.set('compras', compras);
  return compra;
}

function aprovarCompra(compraId) {
  const compras = getCompras();
  const idx = compras.findIndex(c => c.id === compraId);
  if (idx !== -1) {
    compras[idx].status_pagamento = 'Aprovado';
    compras[idx].is_new_noivo = true;
    Store.set('compras', compras);
  }
}

function rejeitarCompra(compraId) {
  const compras = getCompras();
  const idx = compras.findIndex(c => c.id === compraId);
  if (idx !== -1) {
    compras.splice(idx, 1);
    Store.set('compras', compras);
  }
}

/* ─── CATALOG ───────────────────────────────────── */
function getCatalogo() { return Store.get('catalogo') || []; }
function getItemById(id) { return getCatalogo().find(i => i.id === id); }
function saveCatalogo(c) { Store.set('catalogo', c); }

function salvarItem(item) {
  const cat = getCatalogo();
  if (item.id) {
    const idx = cat.findIndex(i => i.id === item.id);
    if (idx !== -1) { cat[idx] = { ...cat[idx], ...item, version: (cat[idx].version || 1) + 1, updated_at: new Date().toISOString() }; }
    else cat.push(item);
  } else {
    item.id = 'c_' + Date.now();
    item.version = 1;
    item.status = 'Ativo';
    item.created_at = new Date().toISOString();
    cat.push(item);
  }
  saveCatalogo(cat);
}

function inativarItem(id) {
  const cat = getCatalogo();
  const idx = cat.findIndex(i => i.id === id);
  if (idx !== -1) {
    cat[idx].status = cat[idx].status === 'Ativo' ? 'Inativo' : 'Ativo';
    saveCatalogo(cat);
  }
}

/* ─── PRE-MONTADAS ──────────────────────────────── */
function getPremontadas() { return Store.get('premontadas') || []; }

/* ─── CAROUSEL STATE ─────────────────────────────── */
const carouselState = {};

function carousel(itemId, dir, context) {
  const item = getItemById(itemId);
  if (!item || !item.imgs || item.imgs.length <= 1) return;
  const key = (context || '') + itemId;
  if (!carouselState[key]) carouselState[key] = 0;
  carouselState[key] = (carouselState[key] + dir + item.imgs.length) % item.imgs.length;
  const idx = carouselState[key];
  const sel = context ? `[data-carousel="${context}-${itemId}"]` : `[data-carousel="${itemId}"]`;
  const wrap = document.querySelector(sel);
  if (!wrap) return;
  const img = wrap.querySelector('.carousel-img');
  if (img) img.src = item.imgs[idx];
  wrap.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function getCarouselImg(itemId, context) {
  const key = (context || '') + itemId;
  return carouselState[key] || 0;
}

function renderItemPhoto(item, context) {
  const imgs = item.imgs && item.imgs.length > 0 ? item.imgs : ['assets/img/dishesTemplate.png'];
  const ctxStr = context || '';
  const dataAttr = ctxStr ? `${ctxStr}-${item.id}` : item.id;
  const idx = carouselState[(ctxStr) + item.id] || 0;
  const multi = imgs.length > 1;
  return `
    <div class="item-carousel" data-carousel="${dataAttr}">
      <img class="carousel-img" src="${imgs[idx] || imgs[0]}" alt="${item.nome}" onerror="this.src='assets/img/dishesTemplate.png'">
      <div class="carousel-setor-badge">${item.setor}</div>
      ${multi ? `
        <button class="carousel-btn carousel-prev" onclick="event.stopPropagation(); carousel('${item.id}', -1, '${ctxStr}')">&#8249;</button>
        <button class="carousel-btn carousel-next" onclick="event.stopPropagation(); carousel('${item.id}', 1, '${ctxStr}')">&#8250;</button>
        <div class="carousel-dots">
          ${imgs.map((_, i) => `<span class="carousel-dot ${i===idx?'active':''}"></span>`).join('')}
        </div>
      ` : ''}
    </div>`;
}

/* ─── UI HELPERS ────────────────────────────────── */
function toast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'error' ? ' error' : '');
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3100);
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.add('open');
    document.body.style.overflow = 'hidden'; // Bloqueia rolagem do fundo
  }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('open');
    if (!document.querySelector('.modal-overlay.open')) document.body.style.overflow = '';
  }
}

function formatMoney(v) { return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }); }
function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'));
  return dt.toLocaleDateString('pt-BR');
}

function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(cpf[10]);
}

function maskPhone(input) {
  input.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length >= 7) v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
    else if (v.length >= 3) v = '(' + v.slice(0,2) + ') ' + v.slice(2);
    this.value = v;
  });
}

function maskCPF(input) {
  input.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.slice(0,3) + '.' + v.slice(3,6) + '.' + v.slice(6,9) + '-' + v.slice(9);
    else if (v.length > 6) v = v.slice(0,3) + '.' + v.slice(3,6) + '.' + v.slice(6);
    else if (v.length > 3) v = v.slice(0,3) + '.' + v.slice(3);
    this.value = v;
  });
}

function maskCurrency(input) {
  input.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    if (v) {
      v = parseInt(v, 10).toString();
      v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
      this.value = 'R$ ' + v;
    } else {
      this.value = '';
    }
  });
}

/* ─── NAVBAR SCROLL EFFECT ──────────────────────── */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ─── NOTIFICATIONS ────────────────────────────── */
function checkNewPurchases(user) {
  if (!user) return;
  const compras = getCompras();
  let novasCompras = [];

  if (user.role === 'gestor') {
    novasCompras = compras.filter(c => c.is_new_gestor || c.is_new);
  } else if (user.role === 'noivo') {
    const lista = getListaByUser(user.id);
    if (lista) {
      novasCompras = compras.filter(c => c.lista_id === lista.id && (c.is_new_noivo || (c.is_new && (c.status_pagamento === 'Aprovado' || c.status_pagamento === 'Confirmado'))));
    }
  }

  if (novasCompras.length > 0) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
      <div class="modal" style="max-width:400px; text-align:center; padding:3.5rem 2rem;">
        <div style="font-size:3.5rem; margin-bottom:1rem; line-height:1;">🎁</div>
        <h3 style="color:var(--verde); font-size:1.4rem; margin-bottom:0.5rem; font-weight:700;">Novo presente comprado!</h3>
        <p style="color:var(--texto-suave); font-size:0.95rem; margin-bottom:2rem; line-height:1.6;">Que alegria! Foram registrados <strong>${novasCompras.length}</strong> novo(s) presente(s) desde a sua última visita.</p>
        <button class="btn btn-verde" style="width:100%" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow='';">Ver Presentes</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Marca como visualizado para não abrir novamente
    const updatedCompras = compras.map(c => {
      if (novasCompras.some(nc => nc.id === c.id)) {
        let updated = { ...c, is_new: false };
        if (user.role === 'gestor') updated.is_new_gestor = false;
        if (user.role === 'noivo') updated.is_new_noivo = false;
        return updated;
      }
      return c;
    });
    Store.set('compras', updatedCompras);
  }
}

/* ─── MODAL CLOSE ON OVERLAY ────────────────────── */
function closeOnEsc(e) {
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal-overlay.open');
    openModals.forEach(m => m.classList.remove('open'));
    if (openModals.length > 0) document.body.style.overflow = '';
  }
}

let modalsInitialized = false;
function initModals() {
  if (modalsInitialized) return;
  modalsInitialized = true;

  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('open');
      if (!document.querySelector('.modal-overlay.open')) document.body.style.overflow = '';
    }
    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn) {
      const overlay = closeBtn.closest('.modal-overlay');
      if (overlay) {
        overlay.classList.remove('open');
        if (!document.querySelector('.modal-overlay.open')) document.body.style.overflow = '';
      }
    }
  });
  document.removeEventListener('keydown', closeOnEsc);
  document.addEventListener('keydown', closeOnEsc);
}

/* ─── TABS ──────────────────────────────────────── */
function initTabs(container) {
  const el = container || document;
  el.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      const parent = btn.closest('[data-tabs]') || btn.parentElement.closest('section') || document;
      parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = parent.querySelector('#' + tabId);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ─── SIDEBAR MOBILE TOGGLE ─────────────────────── */
function initSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  const appLayout = document.querySelector('.app-layout');
  if (!sidebar || !appLayout) return;

  const mobileHeader = document.createElement('div');
  mobileHeader.className = 'mobile-header';
  mobileHeader.innerHTML = `
    <img src="assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style="height:28px;">
    <button class="sidebar-toggle" aria-label="Abrir Menu">
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
    </button>
  `;
  appLayout.insertBefore(mobileHeader, appLayout.firstChild);

  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  appLayout.appendChild(overlay);

  const toggleBtn = mobileHeader.querySelector('.sidebar-toggle');
  
  function toggleMenu() {
    const isOpen = sidebar.classList.toggle('open');
    overlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  toggleBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  // Fecha o menu ao clicar em algum link (se estiver no mobile)
  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { if (window.innerWidth <= 768) toggleMenu(); });
  });
}

/* ─── INIT ──────────────────────────────────────── */
init();
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initModals();
  initTabs();
  initSidebarToggle();
});
