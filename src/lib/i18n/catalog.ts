import type { UiLocale } from "@/lib/i18n/locale-types";

/**
 * Central copy: English + French. Add keys here only — keep both locales in sync.
 */
export const catalog = {
  common_loading: {
    en: "Loading…",
    fr: "Chargement…",
  },
  common_ellipsis: {
    en: "…",
    fr: "…",
  },

  nav_ariaLabel: {
    en: "Main navigation",
    fr: "Navigation principale",
  },
  nav_home: { en: "Home", fr: "Accueil" },
  nav_vehicles: { en: "Vehicles", fr: "Véhicules" },
  nav_account: { en: "Account", fr: "Compte" },

  home_title: {
    en: "Decide with clarity, track what matters",
    fr: "Décidez avec clarté, suivez l’essentiel",
  },
  home_subtitle: {
    en: "Estimate profitability from the offered price and your cost per km, record accept or decline decisions, and see how value adds up over time — synced to your account.",
    fr: "Estimez la rentabilité à partir du prix proposé et de votre coût au km, enregistrez vos décisions (accepté / refusé) et voyez la valeur dans le temps — synchronisé avec votre compte.",
  },

  vehicles_header_title: { en: "Vehicles", fr: "Véhicules" },
  vehicles_header_desc: {
    en: "Add truck profiles (fuel and fixed costs), then pick one in the calculator on Home.",
    fr: "Ajoutez des profils camion (carburant et coûts fixes), puis choisissez-en un dans le calculateur sur l’accueil.",
  },

  account_header_title: { en: "Account", fr: "Compte" },
  account_header_desc: {
    en: "Subscription and sign-in.",
    fr: "Abonnement et connexion.",
  },
  account_legacyNote: {
    en: "Full access (early account, no trial window)",
    fr: "Accès complet (compte initial, sans fenêtre d’essai)",
  },

  checkout_success: {
    en: "Checkout completed. Subscription status will update in a few seconds after Stripe confirms the payment.",
    fr: "Paiement terminé. Le statut d’abonnement se mettra à jour dans quelques secondes après confirmation Stripe.",
  },
  checkout_canceled: {
    en: "Checkout was canceled. You can try again anytime from Account.",
    fr: "Le paiement a été annulé. Vous pouvez réessayer quand vous voulez depuis le compte.",
  },

  account_title: { en: "Account", fr: "Compte" },
  account_signedInAs: { en: "Signed in as", fr: "Connecté en tant que" },
  account_subscription: { en: "Subscription", fr: "Abonnement" },
  account_currentPeriodEnds: {
    en: "Current period ends",
    fr: "Fin de période actuelle",
  },
  account_upgrade: { en: "Upgrade / Subscribe", fr: "Mettre à niveau / S’abonner" },
  account_redirecting: { en: "Redirecting…", fr: "Redirection…" },
  account_secureCheckout: {
    en: "Secure checkout on Stripe. Billing is confirmed server-side after payment.",
    fr: "Paiement sécurisé via Stripe. La facturation est confirmée côté serveur après le paiement.",
  },
  account_signOut: { en: "Sign out", fr: "Se déconnecter" },
  account_notSignedIn: { en: "Not signed in.", fr: "Non connecté." },
  account_networkError: { en: "Network error.", fr: "Erreur réseau." },
  account_checkoutError: {
    en: "Could not start checkout.",
    fr: "Impossible de démarrer le paiement.",
  },
  sub_free: { en: "Free", fr: "Gratuit" },
  sub_trialing: { en: "Trialing", fr: "Essai" },
  sub_active: { en: "Active", fr: "Actif" },
  sub_past_due: { en: "Past due", fr: "Impayé" },
  sub_canceled: { en: "Canceled", fr: "Annulé" },
  sub_unpaid: { en: "Unpaid", fr: "Non payé" },
  sub_expired: {
    en: "Trial ended — read-only access",
    fr: "Essai terminé — accès en lecture seule",
  },
  sub_inactive: { en: "Inactive", fr: "Inactif" },
  sub_appTrial: { en: "Free trial (app)", fr: "Essai gratuit (app)" },

  plan_monthly: { en: "Monthly", fr: "Mensuel" },
  plan_yearly: { en: "Yearly", fr: "Annuel" },
  plan_yearlyBadge: {
    en: "≈ 20% off vs monthly",
    fr: "≈ −20 % vs mensuel",
  },

  billing_trialLine: {
    en: "Free trial — {{days}} days remaining",
    fr: "Essai gratuit — {{days}} jours restants",
  },
  billing_trialHint: {
    en: "Full access during your trial. Subscribe anytime to keep going after it ends.",
    fr: "Accès complet pendant l’essai. Abonnez-vous quand vous voulez pour continuer ensuite.",
  },
  billing_billingIssue: {
    en: "We could not renew your subscription. Your account is in read-only mode until billing is resolved.",
    fr: "Nous n’avons pas pu renouveler votre abonnement. Le compte est en lecture seule jusqu’à régularisation.",
  },
  billing_billingIssueHint: {
    en: "Update your payment method in Stripe, or choose a plan again below.",
    fr: "Mettez à jour votre moyen de paiement sur Stripe, ou choisissez un forfait ci-dessous.",
  },
  billing_readOnlyIntro: {
    en: "Your free trial has ended. Your saved trips and vehicles stay available to view.",
    fr: "Votre essai gratuit est terminé. Vos trajets et véhicules enregistrés restent consultables.",
  },
  billing_readOnlySub: {
    en: "Subscribe to keep calculating new trips, saving decisions, and managing vehicles.",
    fr: "Abonnez-vous pour continuer à calculer des trajets, enregistrer des décisions et gérer les véhicules.",
  },
  billing_viewPlans: {
    en: "View plans & subscribe",
    fr: "Voir les offres et s’abonner",
  },
  billing_readonly_calculator: {
    en: "Your free trial has ended. Subscribe to create new trip calculations.",
    fr: "Votre essai gratuit est terminé. Abonnez-vous pour lancer de nouveaux calculs de trajet.",
  },
  billing_readonly_vehicles: {
    en: "Read-only mode: subscribe to add or edit vehicles.",
    fr: "Lecture seule : abonnez-vous pour ajouter ou modifier des véhicules.",
  },
  billing_readonly_decision: {
    en: "Subscribe to save accept/decline decisions to your history.",
    fr: "Abonnez-vous pour enregistrer vos décisions (accepté / refusé) dans l’historique.",
  },
  billing_readonly_history: {
    en: "Subscribe to clear history or reuse a route in the calculator.",
    fr: "Abonnez-vous pour vider l’historique ou réutiliser un trajet dans le calculateur.",
  },

  account_paywallTitle: {
    en: "Continue using LoadProfit",
    fr: "Continuez à utiliser LoadProfit",
  },
  account_paywallBody: {
    en: "Your free trial has ended. Subscribe to keep calculating trips, saving decisions, and managing vehicles.",
    fr: "Votre essai gratuit est terminé. Abonnez-vous pour continuer à calculer des trajets, enregistrer vos décisions et gérer vos véhicules.",
  },
  account_valueTrips: {
    en: "You have analyzed {{count}} saved trips.",
    fr: "Vous avez analysé {{count}} trajets enregistrés.",
  },
  account_valueLosses: {
    en: "You have avoided about {{amount}} in losses (declined negative trips).",
    fr: "Vous avez évité environ {{amount}} de pertes (refus de trajets déficitaires).",
  },
  account_trialEnds: {
    en: "Trial ends",
    fr: "Fin de l’essai",
  },
  account_daysLeft: {
    en: "{{days}} days left",
    fr: "{{days}} jours restants",
  },
  account_subscribeMonthly: {
    en: "Subscribe monthly",
    fr: "S’abonner au mensuel",
  },
  account_subscribeYearly: {
    en: "Subscribe yearly",
    fr: "S’abonner à l’annuel",
  },
  account_keepReadOnly: {
    en: "Keep read-only access for now",
    fr: "Rester en lecture seule pour l’instant",
  },
  account_planRenewal: {
    en: "Renews or ends on",
    fr: "Renouvellement ou fin le",
  },

  upgrade_activityTitle: {
    en: "Your activity with LoadProfit",
    fr: "Votre activité avec LoadProfit",
  },
  upgrade_metricTripsLabel: {
    en: "Trips analyzed",
    fr: "Trajets analysés",
  },
  upgrade_metricProfitLabel: {
    en: "Potential profit (profitable trips)",
    fr: "Profit potentiel (trajets rentables)",
  },
  upgrade_metricLossesLabel: {
    en: "Losses avoided (declined negative trips)",
    fr: "Pertes évitées (refus de trajets déficitaires)",
  },
  upgrade_fallbackInsight: {
    en: "Start tracking your trips to unlock insights.",
    fr: "Enregistrez vos trajets pour afficher ces indicateurs.",
  },
  upgrade_tripsOnlyHint: {
    en: "Record accept or decline on your saved trips to see profit totals and losses avoided.",
    fr: "Enregistrez « accepté » ou « refusé » sur vos trajets pour voir le profit cumulé et les pertes évitées.",
  },
  dashboard_valueStripCaption: {
    en: "What you have already gained from using LoadProfit",
    fr: "Ce que vous avez déjà retiré de LoadProfit",
  },

  locale_sectionTitle: { en: "Language", fr: "Langue" },
  locale_sectionHint: {
    en: "By default, LoadProfit follows your browser language. Amounts stay in euros (€).",
    fr: "Par défaut, LoadProfit suit la langue du navigateur. Les montants restent en euros (€).",
  },
  locale_auto: {
    en: "Automatic (browser)",
    fr: "Automatique (navigateur)",
  },
  locale_en: { en: "English", fr: "Anglais" },
  locale_fr: { en: "French", fr: "Français" },
  locale_saveError: {
    en: "Could not save language preference.",
    fr: "Impossible d’enregistrer la langue.",
  },

  dashboard_title: { en: "Decision overview", fr: "Vue décision" },
  dashboard_intro: {
    en: "Clear signals from trips you saved — same data as your history, distilled.",
    fr: "Lecture claire des trajets enregistrés — les mêmes données que l’historique, synthétisées.",
  },
  dashboard_lossesAllTime: { en: "Losses avoided (all time)", fr: "Pertes évitées (total)" },
  dashboard_lossesExplain: {
    en: "Estimated money you did not lose by declining trips that showed a negative profit.",
    fr: "Argent estimé non perdu en refusant les trajets à profit négatif.",
  },
  dashboard_thisMonth: { en: "This month", fr: "Ce mois-ci" },
  dashboard_insights: { en: "Insights", fr: "Tendances" },
  dashboard_mostProfitable: { en: "Most profitable:", fr: "Le plus rentable :" },
  dashboard_leastProfitable: { en: "Least profitable:", fr: "Le moins rentable :" },
  dashboard_avgMargin: {
    en: "Average margin on saved trips:",
    fr: "Marge moyenne sur les trajets enregistrés :",
  },
  dashboard_lowMarginWarning: {
    en: "You often accept trips with low margins. Consider raising your minimum price or reviewing cost assumptions.",
    fr: "Vous acceptez souvent des trajets à faible marge. Envisagez un prix minimum plus élevé ou revoyez vos coûts.",
  },
  dashboard_stat_trips: { en: "Trips analyzed", fr: "Trajets analysés" },
  dashboard_stat_tripsHint: {
    en: "Saved estimates in your account",
    fr: "Estimations enregistrées sur votre compte",
  },
  dashboard_stat_accepted: { en: "Accepted", fr: "Acceptés" },
  dashboard_stat_declined: { en: "Declined", fr: "Refusés" },
  dashboard_stat_avgProfit: { en: "Average profit / trip", fr: "Profit moyen / trajet" },
  dashboard_stat_totalPotential: {
    en: "Total potential profit",
    fr: "Profit potentiel total",
  },
  dashboard_stat_totalPotentialHint: {
    en: "Sum of positive profits on saved trips",
    fr: "Somme des profits positifs sur les trajets enregistrés",
  },

  trip_label_departure: {
    en: "Departure city",
    fr: "Ville de départ",
  },
  trip_label_arrival: {
    en: "Destination city",
    fr: "Ville d’arrivée",
  },
  trip_ph_departure: { en: "e.g. Lyon", fr: "ex. Lyon" },
  trip_ph_arrival: { en: "e.g. Marseille", fr: "ex. Marseille" },
  trip_ph_offered: { en: "e.g. 850", fr: "ex. 850" },
  trip_ph_distance: { en: "e.g. 320", fr: "ex. 320" },
  trip_ph_cost: { en: "e.g. 0.45", fr: "ex. 0,45" },
  trip_ph_fuelOverride: { en: "e.g. 1.85", fr: "ex. 1,85" },

  trip_newTitle: { en: "New trip", fr: "Nouveau trajet" },
  trip_newDesc: {
    en: "Where you’re going, what you’re paid, and what it costs you to drive.",
    fr: "Destination, rémunération et coût de conduite.",
  },
  trip_placesHint: {
    en: "Suggestions use Google Places — select one to match the name used for distance.",
    fr: "Suggestions Google Places — choisissez un libellé pour la distance.",
  },
  trip_offeredLabel: { en: "Offered price (€)", fr: "Prix proposé (€)" },
  trip_distanceLabel: { en: "Distance (km, one way)", fr: "Distance (km, aller simple)" },
  trip_distanceManualHint: {
    en: "Enter the one-way distance you want to use for this estimate.",
    fr: "Saisissez la distance aller simple pour cette estimation.",
  },
  trip_useAutoDistance: {
    en: "Use automatic route distance instead",
    fr: "Utiliser la distance d’itinéraire automatique",
  },
  trip_editDistanceManual: { en: "Edit distance manually", fr: "Saisir la distance à la main" },
  trip_editDistanceOptional: {
    en: "— optional if you prefer not to use the estimated route.",
    fr: "— optionnel si vous ne souhaitez pas l’itinéraire estimé.",
  },
  trip_vehicleLabel: { en: "Vehicle (optional)", fr: "Véhicule (optionnel)" },
  trip_vehicleManual: { en: "Manual cost per km", fr: "Coût au km manuel" },
  trip_vehicleOption: {
    en: "{{name}} ({{cost}} €/km)",
    fr: "{{name}} ({{cost}} €/km)",
  },
  trip_vehicleHelp: {
    en: "Selecting a vehicle fills cost per km from your saved profile.",
    fr: "Un véhicule remplit le coût au km depuis votre profil.",
  },
  trip_addVehicles: { en: "Add or manage vehicles", fr: "Ajouter ou gérer les véhicules" },
  trip_diesel: { en: "Diesel", fr: "Diesel" },
  trip_petrol: { en: "Petrol", fr: "Essence" },
  trip_effectiveFuel: {
    en: "· effective fuel (this vehicle)",
    fr: "· carburant effectif (ce véhicule)",
  },
  trip_updatingFuel: {
    en: "Updating fuel prices…",
    fr: "Mise à jour des prix carburant…",
  },
  trip_costPerKm: { en: "Cost per km (€ / km)", fr: "Coût au km (€ / km)" },
  trip_fuelOverrideSummary: {
    en: "Use a different fuel price for this trip only (€/L)",
    fr: "Autre prix carburant pour ce trajet seulement (€/L)",
  },
  trip_fuelOverrideLabel: {
    en: "Effective fuel price for this estimate",
    fr: "Prix carburant effectif pour cette estimation",
  },
  trip_fuelOverrideHelp: {
    en: "Recalculates cost per km from your vehicle consumption and fixed costs. Leave empty to use your saved profile fuel price. Editing “Cost per km” clears this field.",
    fr: "Recalcule le coût au km à partir de la conso et des fixes. Laissez vide pour le profil. Modifier « Coût au km » efface ce champ.",
  },
  trip_emptyReturnTitle: { en: "Empty return", fr: "Retour à vide" },
  trip_emptyReturnHelp: {
    en: "Doubles distance for cost (outbound + unpaid return leg).",
    fr: "Double la distance pour le coût (aller + retour non payé).",
  },
  trip_checking: { en: "Checking…", fr: "Analyse…" },
  trip_checkCta: { en: "Check profitability", fr: "Vérifier la rentabilité" },
  trip_routeError: {
    en: "We couldn't estimate the route distance automatically. You can enter it manually.",
    fr: "Impossible d’estimer la distance automatiquement. Vous pouvez la saisir à la main.",
  },
  trip_costHint_override: {
    en: "Using custom fuel price for this trip",
    fr: "Prix carburant spécifique pour ce trajet",
  },
  trip_costHint_profile: {
    en: "Using vehicle profile",
    fr: "Profil véhicule",
  },
  trip_costHint_custom: {
    en: "Using custom cost per km",
    fr: "Coût au km personnalisé",
  },
  trip_costHelper_vehicle: {
    en: "You can still change cost per km above; that clears the fuel override.",
    fr: "Vous pouvez encore modifier le coût au km ; cela efface le prix carburant ponctuel.",
  },
  trip_costHelper_vehicle2: {
    en: "You can still adjust cost per km or use a one-off fuel price below.",
    fr: "Vous pouvez ajuster le coût au km ou un prix carburant ponctuel ci-dessous.",
  },
  trip_costHelper_noVehicle: {
    en: "Enter your rate, or pick a saved vehicle to use its profile.",
    fr: "Saisissez votre taux ou choisissez un véhicule enregistré.",
  },
  trip_recordedHint: {
    en: "This estimate is recorded in your history.",
    fr: "Cette estimation est enregistrée dans l’historique.",
  },
  trip_fuelCaption_manual: {
    en: "Manual pump price in your profile.",
    fr: "Prix à la pompe manuel dans votre profil.",
  },
  trip_fuelCaption_france: {
    en: "France average benchmark — updates when you open the app.",
    fr: "Référence France moyenne — mise à jour à l’ouverture.",
  },
  trip_fuelCaption_near: {
    en: "Near-you benchmark — updates when you open the app.",
    fr: "Référence près de vous — mise à jour à l’ouverture.",
  },

  error_departure: {
    en: "Enter a departure city.",
    fr: "Indiquez une ville de départ.",
  },
  error_arrival: {
    en: "Enter a destination city.",
    fr: "Indiquez une ville d’arrivée.",
  },
  error_offered: {
    en: "Offered price must be greater than zero.",
    fr: "Le prix proposé doit être supérieur à zéro.",
  },
  error_costPerKm: {
    en: "Cost per km cannot be negative.",
    fr: "Le coût au km ne peut pas être négatif.",
  },
  error_distance: {
    en: "Distance must be greater than zero.",
    fr: "La distance doit être supérieure à zéro.",
  },

  result_title: { en: "Result", fr: "Résultat" },
  result_empty: {
    en: "Enter departure, destination, and price, then click",
    fr: "Saisissez départ, arrivée et prix, puis cliquez sur",
  },
  result_emptyStrong: {
    en: "Check profitability",
    fr: "Vérifier la rentabilité",
  },
  result_emptyEnd: {
    en: "to see if the trip is worth it.",
    fr: "pour voir si le trajet vaut le coup.",
  },
  result_estimateAt: { en: "Estimate at", fr: "Estimation du" },
  result_distance: { en: "Distance", fr: "Distance" },
  result_drivingTime: { en: "Estimated driving time:", fr: "Temps de conduite estimé :" },
  result_routeGoogle: {
    en: "Route distance estimated via Google (one way).",
    fr: "Distance d’itinéraire estimée via Google (aller simple).",
  },
  result_routeManual: {
    en: "Distance entered manually for this estimate (one way).",
    fr: "Distance saisie manuellement pour cette estimation (aller simple).",
  },
  result_transparency: {
    en: "Revenue, cost, and profit use your cost per km and the operating distance (including empty return when enabled). Rounding may differ by cents from the shipper’s quote.",
    fr: "Chiffre d’affaires, coût et profit utilisent votre coût au km et la distance d’exploitation (retour à vide inclus si activé). Des écarts de centimes sont possibles par rapport au devis.",
  },
  result_opDistance: {
    en: "Operating distance (cost basis)",
    fr: "Distance d’exploitation (base de coût)",
  },
  result_revenue: { en: "Revenue (offered price)", fr: "Chiffre d’affaires (prix proposé)" },
  result_totalCost: { en: "Estimated total cost", fr: "Coût total estimé" },
  result_profit: { en: "Estimated profit", fr: "Profit estimé" },
  result_minPrice: {
    en: "Minimum price to break even",
    fr: "Prix minimum pour équilibre",
  },
  result_margin: { en: "Margin on offered price", fr: "Marge sur le prix proposé" },
  result_recordDecision: { en: "Record your decision", fr: "Enregistrer votre décision" },
  result_accept: { en: "Mark as accepted", fr: "Marquer comme accepté" },
  result_decline: { en: "Mark as declined", fr: "Marquer comme refusé" },
  result_emptyReturn: { en: "Empty return", fr: "Retour à vide" },
  result_extraKm: { en: "Extra kilometers:", fr: "Kilomètres supplémentaires :" },
  result_extraCost: { en: "Extra estimated cost:", fr: "Coût supplémentaire estimé :" },
  result_emptyReturnNote: {
    en: "If empty return is off, these amounts are zero (distance is not doubled).",
    fr: "Sans retour à vide, ces montants sont nuls (distance non doublée).",
  },
  result_msg_profitable: {
    en: "This trip would generate an estimated profit of {{amount}}.",
    fr: "Ce trajet générerait un profit estimé de {{amount}}.",
  },
  result_msg_lowMargin: {
    en: "This trip is profitable, but the margin is low.",
    fr: "Ce trajet est rentable, mais la marge est faible.",
  },
  result_msg_loss: {
    en: "You would lose an estimated {{amount}} on this trip.",
    fr: "Vous perdriez environ {{amount}} sur ce trajet.",
  },

  history_title: { en: "History", fr: "Historique" },
  history_subtitle: {
    en: "Synced to your account (up to 100 recent trips kept in the app).",
    fr: "Synchronisé avec votre compte (100 trajets récents conservés).",
  },
  history_clear: { en: "Clear history", fr: "Effacer l’historique" },
  history_emptyTitle: { en: "No saved trips yet", fr: "Aucun trajet enregistré" },
  history_emptyBody: {
    en: "Run a calculation, then choose",
    fr: "Lancez un calcul, puis choisissez",
  },
  history_emptyAccept: { en: "Mark as accepted", fr: "Marquer comme accepté" },
  history_emptyOr: { en: "or", fr: "ou" },
  history_emptyDecline: { en: "Mark as declined", fr: "Marquer comme refusé" },
  history_emptyEnd: {
    en: "to record trips here.",
    fr: "pour enregistrer les trajets ici.",
  },
  history_offered: { en: "Offered", fr: "Proposé" },
  history_cost: { en: "Cost", fr: "Coût" },
  history_profit: { en: "Profit", fr: "Profit" },
  history_margin: { en: "Margin", fr: "Marge" },
  history_estimate: { en: "Estimate", fr: "Estimation" },
  history_date: { en: "Date", fr: "Date" },
  history_route: { en: "Route", fr: "Trajet" },
  history_vehicle: { en: "Vehicle", fr: "Véhicule" },
  history_totalCost: { en: "Total cost", fr: "Coût total" },
  history_decision: { en: "Decision", fr: "Décision" },
  history_useAgain: { en: "Use again", fr: "Réutiliser" },

  trips_confirmClear: {
    en: "Delete all saved trips? This cannot be undone.",
    fr: "Supprimer tous les trajets enregistrés ? Cette action est irréversible.",
  },
  vehicle_confirmDelete: {
    en: "Remove this vehicle profile?",
    fr: "Supprimer ce profil véhicule ?",
  },

  vehicles_savedTitle: { en: "Saved vehicles", fr: "Véhicules enregistrés" },
  vehicles_savedDesc: {
    en: "Total cost per km combines variable (fuel) and fixed costs spread over your estimated monthly distance.",
    fr: "Le coût total au km combine carburant et coûts fixes répartis sur le kilométrage mensuel estimé.",
  },
  vehicles_empty: {
    en: "No vehicles yet. Add one above to auto-fill cost per km in the trip calculator.",
    fr: "Aucun véhicule. Ajoutez-en un ci-dessus pour préremplir le coût au km.",
  },
  vehicles_totalPerKm: { en: "Total cost / km", fr: "Coût total / km" },
  vehicles_fuelPerKm: { en: "Fuel / km", fr: "Carburant / km" },
  vehicles_fixedPerKm: { en: "Fixed / km", fr: "Fixe / km" },
  vehicles_split: { en: "Split (fuel · fixed)", fr: "Répartition (carburant · fixe)" },
  vehicles_table_name: { en: "Name", fr: "Nom" },
  vehicles_table_typeFuel: { en: "Type · fuel", fr: "Type · carburant" },
  vehicles_table_benchmark: { en: "Fuel benchmark", fr: "Référence carburant" },
  vehicles_table_total: { en: "Total / km", fr: "Total / km" },
  vehicles_table_split: { en: "Split", fr: "Répartition" },
  vehicles_delete: { en: "Delete", fr: "Supprimer" },
  vehicles_effectivePerL: { en: "/L effective", fr: "/L effectif" },
  vehicles_profileSince: {
    en: "Profile since",
    fr: "Profil depuis le",
  },

  fuel_title_manual: { en: "Manual price", fr: "Prix manuel" },
  fuel_title_france: { en: "France average", fr: "Moyenne France" },
  fuel_title_near: { en: "Near your location", fr: "Près de votre position" },
  fuel_title_default: { en: "Fuel benchmark", fr: "Référence carburant" },
  fuel_detail_manual: {
    en: "Pump price entered in your vehicle profile.",
    fr: "Prix à la pompe saisi dans le profil véhicule.",
  },
  fuel_detail_france: {
    en: "National index from public fuel data — refreshed when the app loads prices.",
    fr: "Indice national — actualisé au chargement des prix.",
  },
  fuel_detail_near: {
    en: "Area benchmark using your location — refreshed when the app loads prices.",
    fr: "Zone autour de vous — actualisé au chargement des prix.",
  },

  badge_profitable: { en: "Profitable", fr: "Rentable" },
  badge_lowMargin: { en: "Low margin", fr: "Faible marge" },
  badge_loss: { en: "Loss", fr: "Perte" },
  badge_accepted: { en: "Accepted", fr: "Accepté" },
  badge_declined: { en: "Declined", fr: "Refusé" },
  badge_pending: { en: "Pending", fr: "En attente" },

  onboarding_title: { en: "Get started", fr: "Pour commencer" },
  onboarding_subtitle: {
    en: "Three quick steps to use LoadProfit with confidence",
    fr: "Trois étapes pour utiliser LoadProfit sereinement",
  },
  onboarding_dismiss: { en: "Dismiss", fr: "Masquer" },
  onboarding_step1_title: {
    en: "Create your first vehicle",
    fr: "Créez votre premier véhicule",
  },
  onboarding_step1_body: {
    en: "Name, fuel, consumption, and monthly costs — everything in one profile.",
    fr: "Nom, carburant, consommation et coûts mensuels — tout dans un profil.",
  },
  onboarding_addVehicle: { en: "Add a vehicle", fr: "Ajouter un véhicule" },
  onboarding_step2_title: {
    en: "Set fuel and fixed costs",
    fr: "Définissez carburant et coûts fixes",
  },
  onboarding_step2_body: {
    en: "Use a manual pump price or a live benchmark — your cost per km updates automatically.",
    fr: "Prix à la pompe manuel ou référence en direct — le coût au km se met à jour.",
  },
  onboarding_step3_title: {
    en: "Run your first trip check",
    fr: "Lancez votre premier calcul de trajet",
  },
  onboarding_step3_body: {
    en: "Enter route and price below, then record accept or decline to build your history.",
    fr: "Saisissez l’itinéraire et le prix, puis enregistrez accepté ou refus pour constituer l’historique.",
  },
  onboarding_goCalculator: { en: "Go to calculator", fr: "Aller au calculateur" },

  location_title: {
    en: "Allow location access to estimate local fuel prices automatically.",
    fr: "Autorisez la localisation pour estimer les prix carburant près de vous.",
  },
  location_body: {
    en: "This helps LoadProfit use a more relevant fuel benchmark for your area. You can skip — the app works with France-wide averages or manual prices.",
    fr: "LoadProfit utilise une référence plus pertinente pour votre zone. Vous pouvez refuser — l’app fonctionne avec la moyenne France ou un prix manuel.",
  },
  location_allow: { en: "Allow", fr: "Autoriser" },
  location_skip: { en: "Skip", fr: "Passer" },
  location_busy: { en: "…", fr: "…" },

  auth_loading: { en: "Loading…", fr: "Chargement…" },
  auth_signIn: { en: "Sign in", fr: "Connexion" },
  auth_createAccount: { en: "Create account", fr: "Créer un compte" },
  auth_description: {
    en: "Use your email or Google to access LoadProfit from any device.",
    fr: "E-mail ou Google pour accéder à LoadProfit depuis n’importe quel appareil.",
  },
  auth_google: { en: "Continue with Google", fr: "Continuer avec Google" },
  auth_orEmail: { en: "or email", fr: "ou e-mail" },
  auth_email: { en: "Email", fr: "E-mail" },
  auth_password: { en: "Password", fr: "Mot de passe" },
  auth_passwordHint: {
    en: "At least 6 characters (Firebase default).",
    fr: "Au moins 6 caractères (réglage Firebase).",
  },
  auth_wait: { en: "Please wait…", fr: "Veuillez patienter…" },
  auth_toggleSignUp: { en: "Need an account? Sign up", fr: "Pas de compte ? Inscription" },
  auth_toggleSignIn: { en: "Already have an account? Sign in", fr: "Déjà un compte ? Connexion" },
  auth_error_emailPassword: {
    en: "Enter a valid email and a password of at least 6 characters.",
    fr: "E-mail valide et mot de passe d’au moins 6 caractères.",
  },
  auth_err_emailInUse: {
    en: "This email is already registered. Try signing in.",
    fr: "Cet e-mail est déjà utilisé. Essayez la connexion.",
  },
  auth_err_invalidEmail: {
    en: "Enter a valid email address.",
    fr: "Indiquez une adresse e-mail valide.",
  },
  auth_err_weakPassword: {
    en: "Password should be at least 6 characters.",
    fr: "Le mot de passe doit faire au moins 6 caractères.",
  },
  auth_err_wrongCreds: {
    en: "Incorrect email or password.",
    fr: "E-mail ou mot de passe incorrect.",
  },
  auth_err_tooMany: {
    en: "Too many attempts. Try again later.",
    fr: "Trop de tentatives. Réessayez plus tard.",
  },
  auth_err_popup: {
    en: "Sign-in was canceled.",
    fr: "Connexion annulée.",
  },
  auth_err_operationNotAllowed: {
    en: "Email/password sign-in is disabled in Firebase. Enable it in Console → Authentication → Sign-in method.",
    fr: "Connexion e-mail/mot de passe désactivée dans Firebase. Activez-la dans la console.",
  },
  auth_err_network: {
    en: "Network error. Check your connection or try again.",
    fr: "Erreur réseau. Vérifiez la connexion.",
  },
  auth_err_generic: {
    en: "Something went wrong. Please try again.",
    fr: "Une erreur s’est produite. Réessayez.",
  },
  auth_err_failed: {
    en: "Sign-in failed ({{code}}). Check the browser console.",
    fr: "Échec de connexion ({{code}}). Voir la console du navigateur.",
  },
  auth_err_apiKey: {
    en: "Firebase API key rejected: check Web config (apiKey) in Firebase project settings, then in Google Cloud → API keys allow Identity Toolkit API and http://localhost:3000/*. Restart npm run dev.",
    fr: "Clé API Firebase refusée : vérifiez la config Web (apiKey) dans Firebase, puis dans Google Cloud les clés API et Identity Toolkit, référents http://localhost:3000/*. Redémarrez npm run dev.",
  },

  vehicle_addTitle: { en: "Add a vehicle", fr: "Ajouter un véhicule" },
  vehicle_addDesc: {
    en: "Store fuel and fixed monthly costs. LoadProfit derives an operating cost per km you can reuse in the trip calculator.",
    fr: "Enregistrez carburant et coûts fixes mensuels. LoadProfit calcule un coût d’exploitation au km réutilisable dans le calculateur.",
  },
  vehicle_name: { en: "Name", fr: "Nom" },
  vehicle_type: { en: "Vehicle type", fr: "Type de véhicule" },
  vehicle_fuelType: { en: "Fuel type", fr: "Carburant" },
  vehicle_monthlyKm: { en: "Estimated monthly km", fr: "Km mensuels estimés" },
  vehicle_monthlyKmHint: {
    en: "Used to spread fixed costs per kilometer. Must be > 0.",
    fr: "Répartit les coûts fixes au km. Doit être > 0.",
  },
  vehicle_fuelSection: { en: "Fuel", fr: "Carburant" },
  vehicle_fuelSource: { en: "Fuel price source", fr: "Source du prix carburant" },
  vehicle_opt_manual: { en: "Manual (€ / L)", fr: "Manuel (€ / L)" },
  vehicle_opt_france: {
    en: "France average (official data)",
    fr: "Moyenne France (données officielles)",
  },
  vehicle_opt_near: {
    en: "Near my location (automatic)",
    fr: "Près de moi (automatique)",
  },
  vehicle_cons: { en: "Avg. consumption (L / 100 km)", fr: "Conso moy. (L / 100 km)" },
  vehicle_basePrice: { en: "Base fuel price (€ / L)", fr: "Prix carburant de base (€ / L)" },
  vehicle_benchmarkLabel: { en: "Benchmark fuel (€ / L)", fr: "Référence carburant (€ / L)" },
  vehicle_benchmarkNote: {
    en: "This value is not stored as a fixed number — it refreshes from official data whenever you open LoadProfit, so your cost per km stays realistic.",
    fr: "Cette valeur n’est pas figée — elle est rafraîchie à l’ouverture pour un coût au km réaliste.",
  },
  vehicle_fuelAdj: { en: "Fuel adjustment (€ / L)", fr: "Ajustement carburant (€ / L)" },
  vehicle_fuelAdjManual: {
    en: "On top of your base price (e.g. fuel card discount). Effective = base + adjustment.",
    fr: "En plus du prix de base (ex. carte carburant). Effectif = base + ajustement.",
  },
  vehicle_fuelAdjBench: {
    en: "On top of the live benchmark (e.g. fuel card discount). Effective = benchmark + adjustment.",
    fr: "En plus de la référence en direct. Effectif = référence + ajustement.",
  },
  vehicle_monthlyFixed: { en: "Monthly fixed costs (€)", fr: "Coûts fixes mensuels (€)" },
  vehicle_insurance: { en: "Insurance", fr: "Assurance" },
  vehicle_maintenance: { en: "Maintenance", fr: "Entretien" },
  vehicle_tires: { en: "Tires (budget)", fr: "Pneumatiques (budget)" },
  vehicle_other: { en: "Other fixed costs", fr: "Autres coûts fixes" },
  vehicle_save: { en: "Save vehicle", fr: "Enregistrer le véhicule" },
  vehicle_placeholder_name: { en: "e.g. Truck 01", fr: "ex. Camion 01" },
  vehicle_placeholder_type: { en: "e.g. 19t rigid", fr: "ex. 19t rigide" },
  vehicle_ph_monthlyKm: { en: "e.g. 8500", fr: "ex. 8500" },
  vehicle_ph_cons: { en: "e.g. 28", fr: "ex. 28" },
  vehicle_ph_fuelPrice: { en: "e.g. 1.65", fr: "ex. 1,65" },

  vehicle_err_name: {
    en: "Enter a name for this vehicle.",
    fr: "Indiquez un nom pour ce véhicule.",
  },
  vehicle_err_type: {
    en: "Enter a vehicle type (e.g. rigid truck).",
    fr: "Indiquez un type de véhicule (ex. porteur).",
  },
  vehicle_err_monthlyKm: {
    en: "Estimated monthly kilometers must be greater than zero.",
    fr: "Les km mensuels estimés doivent être supérieurs à zéro.",
  },
  vehicle_err_consumption: {
    en: "Consumption cannot be negative.",
    fr: "La consommation ne peut pas être négative.",
  },
  vehicle_err_fuelPrice: {
    en: "Enter a positive base fuel price (€/L).",
    fr: "Indiquez un prix carburant de base positif (€/L).",
  },
  vehicle_err_adj: {
    en: "Enter a valid adjustment (use 0 if none).",
    fr: "Ajustement valide (0 si aucun).",
  },
  vehicle_err_adjNegative: {
    en: "Benchmark + adjustment cannot be negative overall.",
    fr: "Référence + ajustement ne peut pas être négatif au total.",
  },
  vehicle_err_insurance: { en: "Insurance cannot be negative.", fr: "L’assurance ne peut pas être négative." },
  vehicle_err_maintenance: {
    en: "Maintenance cannot be negative.",
    fr: "L’entretien ne peut pas être négatif.",
  },
  vehicle_err_tires: { en: "Tire budget cannot be negative.", fr: "Le budget pneus ne peut pas être négatif." },
  vehicle_err_other: {
    en: "Other fixed costs cannot be negative.",
    fr: "Les autres coûts fixes ne peuvent pas être négatifs.",
  },

  vehicle_help_manual: {
    en: "Enter your current pump price, or choose an automatic benchmark above.",
    fr: "Saisissez votre prix à la pompe ou choisissez une référence automatique ci-dessus.",
  },
  vehicle_line_manual: { en: "Source: manual", fr: "Source : manuel" },
  vehicle_loading_france: { en: "Loading France average…", fr: "Chargement moyenne France…" },
  vehicle_line_france_ok: {
    en: "Source: France average",
    fr: "Source : moyenne France",
  },
  vehicle_line_france_fb: {
    en: "Source: France average (fallback)",
    fr: "Source : moyenne France (secours)",
  },
  vehicle_help_france_ok: {
    en: "Auto-filled from current France average fuel price (official open dataset). You can still adjust this value manually.",
    fr: "Rempli avec la moyenne France actuelle (données ouvertes). Vous pouvez ajuster.",
  },
  vehicle_help_france_fb: {
    en: "Using fallback average fuel price. You can still edit the value.",
    fr: "Moyenne de secours. Vous pouvez modifier la valeur.",
  },
  vehicle_help_near_noLoc: {
    en: "Location not available — using France-wide average. Allow location when prompted, or pick another source. You can still edit the price.",
    fr: "Localisation indisponible — moyenne France. Autorisez la position ou changez de source. Modifiable.",
  },
  vehicle_loading_near: {
    en: "Loading benchmark near your location…",
    fr: "Chargement référence près de vous…",
  },
  vehicle_line_near: { en: "Source: near your location", fr: "Source : près de vous" },
  vehicle_help_near_local: {
    en: "Auto-filled from fuel prices near your location. You can still adjust this value manually.",
    fr: "Rempli avec les prix près de vous. Ajustement possible.",
  },
  vehicle_help_near_national: {
    en: "Using France-wide average — not enough stations in the immediate radius. You can still adjust manually.",
    fr: "Moyenne France — pas assez de stations à proximité. Ajustement manuel possible.",
  },
  vehicle_line_fallback_est: {
    en: "Source: fallback estimate",
    fr: "Source : estimation de secours",
  },
  vehicle_help_fallback: {
    en: "Using fallback average fuel price. You can still edit the value.",
    fr: "Moyenne de secours. Modifiable.",
  },
  vehicle_help_near_error: {
    en: "Could not load local benchmark — using France average instead.",
    fr: "Référence locale impossible — moyenne France utilisée.",
  },
  vehicle_help_values_fallback: {
    en: "Using fallback values.",
    fr: "Valeurs de secours.",
  },

  settings_vehicleSetup: { en: "Vehicle setup", fr: "Réglage véhicule" },
  settings_vehicleSetupCount: {
    en: "Vehicle setup — {{count}} vehicle",
    fr: "Réglage véhicule — {{count}} véhicule",
  },
  settings_vehicleSetupCountPlural: {
    en: "Vehicle setup — {{count}} vehicles",
    fr: "Réglage véhicule — {{count}} véhicules",
  },
  settings_expandEmpty: {
    en: "Expand to add a truck profile (fuel + monthly fixed costs). Then choose it in the calculator below.",
    fr: "Développez pour ajouter un profil (carburant + coûts fixes). Puis choisissez-le dans le calculateur.",
  },
  settings_expandHas: {
    en: "Expand only when you need to add or remove a profile.",
    fr: "Développez seulement pour ajouter ou retirer un profil.",
  },
} as const;

export type MessageId = keyof typeof catalog;

export function translate(locale: UiLocale, id: MessageId): string {
  const row = catalog[id];
  return locale === "fr" ? row.fr : row.en;
}

/** Replace {{name}} style placeholders in a translated string. */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{{${k}}}`).join(String(v));
  }
  return out;
}
