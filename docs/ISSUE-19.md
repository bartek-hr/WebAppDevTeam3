# #19 — Mijn biedingen (huidige sprint)

Deze branch levert alleen het overzicht op `/offers`: ontvangen en verstuurde biedingen,
status, geldigheid, de twee game-edities en het andere lid. Accepteren, afwijzen, annuleren,
het vervullen van items en actiehooks voor #27 vallen buiten deze sprint.

## Gedeeld mockcontract (#25 / #26)

De branch gebruikt `wishlistItems` direct uit `features/wishlist/mockStore.ts`.
Het contract is ongewijzigd overgenomen via commit
`50ffd44f521a8293f00b2905f3e109b5e3adb127` van #26; de tijdelijke #19-fixtures zijn verwijderd.
De store wordt hier niet uitgebreid. De wishlistpagina en CRUD blijven werk voor bartek-hr
in #25; de gedeelde endpoint/hook en het overzicht van alle verlanglijsten blijven bij #26.

De seed-biedingen verwijzen naar de afgesproken IDs 1, 3, 4 en 5. Het geaccepteerde bod
hoort bij het vervulde item 4 van m2. Daardoor ziet m1 twee ontvangen en vier verstuurde
biedingen. Nieuwe biedingen op alle zes gedeelde items worden nu ook gekoppeld.
Een routejourney controleert dit met een nieuw bod op item 6. Er zijn geen biedingsacties
of aanvullende controles aan het bestaande POST-endpoint toegevoegd.

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
