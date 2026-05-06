<?php
// telecharger-qr.php

// 1. Récupérer les URLs depuis le paramètre GET
$qrUrlsJson = $_GET['qrUrls'] ?? '[]';
$qrData = json_decode($qrUrlsJson, true); // true pour obtenir un tableau associatif

if (empty($qrData)) {
    die("Aucune URL de QR code fournie.");
}

// 2. Initialiser le fichier ZIP
$zipFileName = 'qr_codes_' . date('Ymd_His') . '.zip';
$zip = new ZipArchive();
if ($zip->open($zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
    die("Impossible de créer le fichier ZIP.");
}

// 3. Télécharger chaque image et l'ajouter au ZIP
foreach ($qrData as $item) {
    $qrUrl = $item['QrUrl'];
    $qrId = $item['ID']; // Ou un nom plus significatif

    // Télécharger le contenu de l'image
    $imageData = @file_get_contents($qrUrl); // @ pour masquer les warnings si l'URL est invalide

    if ($imageData === FALSE) {
        // Gérer l'erreur de téléchargement
        error_log("Impossible de télécharger le QR code depuis : " . $qrUrl);
        continue;
    }

    // Ajouter l'image au ZIP
    // Nom du fichier dans le ZIP (ex: QR_CODE_123.png)
    $zip->addFromString($qrId . '.png', $imageData);
}

// 4. Fermer le fichier ZIP
$zip->close();

// 5. Envoyer le fichier ZIP au navigateur
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $zipFileName . '"');
header('Content-Length: ' . filesize($zipFileName));
readfile($zipFileName);

// 6. Supprimer le fichier ZIP temporaire
unlink($zipFileName);
exit;
?>
