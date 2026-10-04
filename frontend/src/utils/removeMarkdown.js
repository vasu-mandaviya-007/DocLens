function removeMarkdown(md) {
    return md
        // Remove headers
        .replace(/^#+\s+/gm, '')
        // Remove bold/italic formatting
        .replace(/(\*\*|__)(.*?)\1/g, '\$2')
        .replace(/(\*|_)(.*?)\1/g, '\$2')
        // Remove links [text](url) but keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '\$1')
        // Remove inline code blocks
        .replace(/`([^`]+)`/g, '\$1');
}


export default removeMarkdown;