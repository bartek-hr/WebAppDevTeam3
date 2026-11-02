# #26 — alle verlanglijsten, huidige sprint

Deze pagina toont wensen, zoeken op gametitel en een ledenfilter. De naam van het lid
linkt naar `/members/:id`. Filters staan in de URL (`q`, `member`), passend bij de
bestaande verlanglijstlink op het ledenprofiel. De pagina toont prioriteit, notities en
vervulde wensen; biedingen openen of wijzigen hoort bij latere scope. Sluit #26 dus
niet als volledig afgehandeld.

## Tijdelijke data en afhankelijkheden

#25 (eigen verlanglijst én gedeelde mockitems/store) is werk van bartek-hr. Hier wordt
geen gedeelde store, CRUD of eigen-verlanglijstpagina geïmplementeerd.
`wishlistsPreviewData.ts` bevat uitsluitend tijdelijke, alleen-lezen voorbeelden voor
#26, met IDs 2601–2606. De mockroute `/api/wishlists-preview` en React Query-key
`['wishlists-preview']` zijn bewust lokaal aan deze preview. Dit is geen backendcontract.
#19 mag deze tijdelijke IDs niet gebruiken als gedeelde biedingsreferenties.

Wanneer #25 beschikbaar is: spreek met de eigenaar de gedeelde route, query-key en
IDs af, vervang de preview-query/handler door die gedeelde bron en verwijder de
preview-fixtures. Verifieer daarna dat wijzigingen in #25 ook deze lijst verversen.
Die integratie en de koppeling met #19 zijn uitgesteld, niet nagebootst.

## Verificatie

`npx vitest run src/features/wishlist/WishlistsPage.test.tsx` controleert via de echte
query-hooks en MSW de lijst, gecombineerde filters, heropenen van URL-filters,
profielnavigatie, ontbrekende resultaten, lege data en fouten/herstel van beide queries.
Dit zijn DOM-journeytests, geen bewijs voor de volledige browserlayout.
