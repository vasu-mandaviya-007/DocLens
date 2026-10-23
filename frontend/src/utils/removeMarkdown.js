function removeMarkdown(md) {
    
    return md
        .replace(/^#+\s+/gm, '')
        .replace(/(\*\*|__)(.*?)\1/g, '\$2')
        .replace(/(\*|_)(.*?)\1/g, '\$2')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '\$1')
        .replace(/`([^`]+)`/g, '\$1');
}


export default removeMarkdown;