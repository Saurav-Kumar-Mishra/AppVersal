export function adjustColor(color, amount) {
    // Remove the # if it exists
    color = color.replace('#', '')

    // Parse the color
    let r = Number.parseInt(color.substring(0, 2), 16)
    let g = Number.parseInt(color.substring(2, 4), 16)
    let b = Number.parseInt(color.substring(4, 6), 16)

    // Adjust the color
    r = Math.min(255, Math.max(0, r + amount))
    g = Math.min(255, Math.max(0, g + amount))
    b = Math.min(255, Math.max(0, b + amount))

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g
        .toString(16)
        .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Helper function to determine text color based on background
export function getContrastColor(hexColor) {
    // Remove the # if it exists
    hexColor = hexColor.replace('#', '')

    // Parse the color
    const r = Number.parseInt(hexColor.substring(0, 2), 16)
    const g = Number.parseInt(hexColor.substring(2, 4), 16)
    const b = Number.parseInt(hexColor.substring(4, 6), 16)

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Return black for bright colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff'
}
