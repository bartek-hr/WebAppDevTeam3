# #19 — Mijn biedingen (huidige sprint)

Deze branch levert alleen het overzicht op `/offers`: ontvangen en verstuurde biedingen,
status, geldigheid, de twee game-edities en het andere lid. Accepteren, afwijzen, annuleren,
het vervullen van items en actiehooks voor #27 vallen buiten deze sprint.

## Afhankelijkheid van #25

#25 is toegewezen aan bartek-hr. Deze branch implementeert geen verlanglijstpagina, CRUD,
endpoint of gedeelde verlanglijst-store. `features/trading/mockWishlistFixtures.ts` bevat
uitsluitend tijdelijke fixtures voor #19, met IDs 1901–1904. Deze fixtures zijn geen
vervangende implementatie van #25 en worden niet door verlanglijstpagina's gebruikt.
De fixtures zijn alleen-lezen en uitsluitend bedoeld voor de #19-preview. Alleen het bestaande
`WishlistItem`-type is een vast contract; definitieve IDs, store en querycontract komen van
bartek-hr. Het eerder aangeboden contract uit `50ffd44` is ingetrokken en teruggedraaid.

Na oplevering van #25 moet het biedingenoverzicht diens gedeelde mockitems gebruiken:

- Vervang de import van `offerWishlistFixtures` in `trading/mocks.ts` door de afgesproken
  gedeelde bron en stem `wishlistItemId` in de seed-biedingen af op de echte mockitems.
- Controleer met #26 dat beide overzichten dezelfde items/IDs gebruiken.
- Controleer dat nieuw aangemaakte biedingen op die items in het overzicht verschijnen.
  Nu worden alleen biedingen op de tijdelijke #19-items gekoppeld; andere item-IDs zijn
  bewust nog niet geïntegreerd. Het bestaande POST-endpoint is niet uitgebreid.

`GET /api/offers` vereist een ingelogd mocklid en retourneert alleen diens ontvangen en
verstuurde biedingen, nieuwste eerst. De response verrijkt het bestaande `Offer` met
`wishlistItem`, `owner` en `offeredBy`. `isValid` blijft berekend via de bestaande regel
van 14 dagen, inclusief de laatste dag. De query wordt elke minuut vernieuwd.

## Verificatie en bestaande beperking

Handmatig gecontroleerd op 1280×800 en 375×812: richtingen, alle statussen, verlopen bod,
game-edities, profiel-/gamelinks, verversen en afwezigheid van biedingsacties.
Gerichte routejourneys controleren overzicht, lege toestand en herstel na een fout.

Op de huidige basis faalt `npm ci && npm run build` door bestaande imports van
`react-bootstrap` en `react-bootstrap-icons` in uitlenen en `MakeOfferModal`, terwijl
beide packages uit package.json zijn verwijderd. Voor browserverificatie zijn deze lokaal
met `npm install --no-save --package-lock=false react-bootstrap react-bootstrap-icons`
geïnstalleerd. Daarmee slaagt de build; er zijn geen packagebestanden gewijzigd.
De bestaande CSS-migratie moet apart worden afgerond voordat een schone installatie van
de volledige app kan bouwen. Dit is geen #19-wijziging.
