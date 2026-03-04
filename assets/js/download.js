
// Download photostrip directly to user's device
function downloadStrip(canvasId = "photoCanvas") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        alert("Photo strip not found!");
        return;
    }

    const link = document.createElement("a");
    link.download = "memoriods_photostrip.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}
