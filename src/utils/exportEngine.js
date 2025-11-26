/**
 * Export Engine - Converts block/JSON model to HTML and MJML
 */

import { BLOCK_TYPES } from '../stores/templateStore';

/**
 * Escape HTML special characters
 */
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Convert CSS object to inline style string
 */
const stylesToString = (styles) => {
  return Object.entries(styles || {})
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');
};

/**
 * Generate HTML for a single block
 */
const blockToHtml = (block, isEmail = true) => {
  const { type, styles = {} } = block;

  switch (type) {
    case BLOCK_TYPES.HEADING: {
      const level = block.level || 2;
      const Tag = `h${level}`;
      const htmlStyles = {
        margin: '0',
        padding: styles.padding || '10px',
        fontSize: styles.fontSize || '24px',
        fontWeight: styles.fontWeight || 'bold',
        textAlign: styles.textAlign || 'center',
        color: styles.color || '#333333',
        lineHeight: styles.lineHeight || '1.3',
      };
      return `<${Tag} style="${stylesToString(htmlStyles)}">${escapeHtml(block.content || '')}</${Tag}>`;
    }

    case BLOCK_TYPES.TEXT:
    case BLOCK_TYPES.PARAGRAPH: {
      const htmlStyles = {
        margin: '0',
        padding: styles.padding || '10px',
        fontSize: styles.fontSize || '16px',
        fontWeight: styles.fontWeight || 'normal',
        textAlign: styles.textAlign || 'left',
        color: styles.color || '#333333',
        lineHeight: styles.lineHeight || '1.5',
      };
      return `<p style="${stylesToString(htmlStyles)}">${escapeHtml(block.content || '')}</p>`;
    }

    case BLOCK_TYPES.IMAGE: {
      const imgStyles = {
        display: 'block',
        maxWidth: styles.maxWidth || '100%',
        width: styles.width || '100%',
        height: 'auto',
        margin: styles.alignment === 'center' ? '0 auto' : styles.alignment === 'right' ? '0 0 0 auto' : '0',
        borderRadius: styles.borderRadius || '0',
      };
      const containerStyles = {
        padding: styles.padding || '10px',
        textAlign: styles.alignment || 'center',
      };
      const imgTag = `<img src="${block.src || ''}" alt="${escapeHtml(block.alt || '')}" style="${stylesToString(imgStyles)}" />`;

      if (block.link) {
        return `<div style="${stylesToString(containerStyles)}"><a href="${block.link}" target="_blank" style="display: inline-block;">${imgTag}</a></div>`;
      }
      return `<div style="${stylesToString(containerStyles)}">${imgTag}</div>`;
    }

    case BLOCK_TYPES.BUTTON: {
      const buttonStyles = {
        display: 'inline-block',
        padding: styles.padding || '12px 24px',
        backgroundColor: styles.backgroundColor || '#815374',
        color: styles.color || '#ffffff',
        fontSize: styles.fontSize || '16px',
        fontWeight: styles.fontWeight || 'bold',
        textDecoration: 'none',
        borderRadius: styles.borderRadius || '4px',
        border: 'none',
        cursor: 'pointer',
      };
      const containerStyles = {
        textAlign: styles.alignment || 'center',
        padding: '10px',
      };

      if (isEmail) {
        // Email-safe button using table
        return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
  <tr>
    <td style="border-radius: ${styles.borderRadius || '4px'}; background-color: ${styles.backgroundColor || '#815374'};">
      <a href="${block.link || '#'}" target="_blank" style="${stylesToString(buttonStyles)}">${escapeHtml(block.text || 'Click Here')}</a>
    </td>
  </tr>
</table>`;
      }

      return `<div style="${stylesToString(containerStyles)}"><a href="${block.link || '#'}" style="${stylesToString(buttonStyles)}">${escapeHtml(block.text || 'Click Here')}</a></div>`;
    }

    case BLOCK_TYPES.DIVIDER: {
      const dividerStyles = {
        margin: styles.padding || '10px 0',
        borderTop: `${styles.borderWidth || '1px'} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#e0e0e0'}`,
      };
      return `<hr style="${stylesToString(dividerStyles)}" />`;
    }

    case BLOCK_TYPES.SPACER: {
      return `<div style="height: ${styles.height || '20px'};"></div>`;
    }

    case BLOCK_TYPES.SECTION: {
      const sectionStyles = {
        backgroundColor: styles.backgroundColor || '#ffffff',
        padding: styles.padding || '20px',
        borderRadius: styles.borderRadius || '0',
      };
      const childrenHtml = (block.children || []).map((child) => blockToHtml(child, isEmail)).join('\n');
      return `<div style="${stylesToString(sectionStyles)}">${childrenHtml}</div>`;
    }

    case BLOCK_TYPES.COLUMNS: {
      const columns = block.columns || [];
      const columnCount = columns.length;
      const gap = styles.gap || '20px';
      const columnWidth = `${Math.floor(100 / columnCount)}%`;

      if (isEmail) {
        // Email-safe columns using table
        const columnsHtml = columns
          .map((col) => {
            const colContent = col.blocks.map((b) => blockToHtml(b, isEmail)).join('\n');
            return `<td style="width: ${columnWidth}; vertical-align: top; padding: 0 ${parseInt(gap) / 2}px;">${colContent}</td>`;
          })
          .join('\n');

        return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: ${styles.padding || '10px'};">
  <tr>
    ${columnsHtml}
  </tr>
</table>`;
      }

      // Web columns using flexbox
      const containerStyles = {
        display: 'flex',
        gap,
        padding: styles.padding || '10px',
      };
      const colStyles = {
        flex: '1',
        minWidth: '0',
      };
      const columnsHtml = columns
        .map((col) => {
          const colContent = col.blocks.map((b) => blockToHtml(b, isEmail)).join('\n');
          return `<div style="${stylesToString(colStyles)}">${colContent}</div>`;
        })
        .join('\n');

      return `<div style="${stylesToString(containerStyles)}">${columnsHtml}</div>`;
    }

    case BLOCK_TYPES.SOCIAL: {
      const platforms = block.platforms || [];
      const iconSize = styles.iconSize || '32px';
      const containerStyles = {
        textAlign: styles.alignment || 'center',
        padding: styles.padding || '10px',
      };

      const iconsHtml = platforms
        .filter((p) => p.url)
        .map((platform) => {
          const iconUrl = getSocialIconUrl(platform.type);
          return `<a href="${platform.url}" target="_blank" style="display: inline-block; margin: 0 5px;"><img src="${iconUrl}" alt="${platform.type}" width="${parseInt(iconSize)}" height="${parseInt(iconSize)}" style="display: block;" /></a>`;
        })
        .join('\n');

      return `<div style="${stylesToString(containerStyles)}">${iconsHtml}</div>`;
    }

    case BLOCK_TYPES.VIDEO: {
      if (!block.videoUrl) return '';

      const containerStyles = {
        textAlign: 'center',
        padding: styles.padding || '10px',
      };

      // For email, show thumbnail with play button overlay
      if (isEmail && block.thumbnail) {
        return `
<div style="${stylesToString(containerStyles)}">
  <a href="${block.videoUrl}" target="_blank" style="display: inline-block; position: relative;">
    <img src="${block.thumbnail}" alt="Video" style="max-width: 100%; display: block;" />
  </a>
</div>`;
      }

      // For web, embed video
      const videoId = extractVideoId(block.videoUrl);
      if (videoId) {
        return `
<div style="${stylesToString(containerStyles)}">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="max-width: 100%;"></iframe>
</div>`;
      }

      return '';
    }

    case BLOCK_TYPES.HTML: {
      // Raw HTML block - use with caution
      return block.htmlContent || '';
    }

    default:
      return '';
  }
};

/**
 * Get social media icon URL
 */
const getSocialIconUrl = (platform) => {
  // Using placeholder icons - in production, replace with actual icon URLs
  const icons = {
    facebook: 'https://cdn-icons-png.flaticon.com/32/733/733547.png',
    twitter: 'https://cdn-icons-png.flaticon.com/32/733/733579.png',
    instagram: 'https://cdn-icons-png.flaticon.com/32/733/733558.png',
    linkedin: 'https://cdn-icons-png.flaticon.com/32/733/733561.png',
    youtube: 'https://cdn-icons-png.flaticon.com/32/733/733646.png',
  };
  return icons[platform] || icons.facebook;
};

/**
 * Extract YouTube video ID from URL
 */
const extractVideoId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

/**
 * Convert blocks to complete HTML document
 */
export const blocksToHtml = (blocks, settings = {}, isEmail = true) => {
  const {
    width = '600px',
    backgroundColor = '#f4f4f4',
    contentBackgroundColor = '#ffffff',
    fontFamily = 'Arial, sans-serif',
    preheaderText = '',
  } = settings;

  const blocksHtml = blocks.map((block) => blockToHtml(block, isEmail)).join('\n');

  if (isEmail) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body { margin: 0; padding: 0; min-width: 100%; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; display: block; max-width: 100%; }
    .wrapper { width: 100%; table-layout: fixed; background-color: ${backgroundColor}; }
    .main { max-width: ${width}; background-color: ${contentBackgroundColor}; margin: 0 auto; font-family: ${fontFamily}; }
    @media screen and (max-width: 600px) {
      .main { width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: ${fontFamily};">
  ${preheaderText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${escapeHtml(preheaderText)}</div>` : ''}
  <center class="wrapper">
    <table role="presentation" class="main" width="${parseInt(width)}" cellpadding="0" cellspacing="0" style="margin: 0 auto; background-color: ${contentBackgroundColor};">
      <tr>
        <td>
          ${blocksHtml}
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
  }

  // Web HTML (non-email)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaign</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${fontFamily}; background-color: ${backgroundColor}; }
    .container { max-width: ${width}; margin: 0 auto; background-color: ${contentBackgroundColor}; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="container">
    ${blocksHtml}
  </div>
</body>
</html>`;
};

/**
 * Generate MJML for a single block
 */
const blockToMjml = (block) => {
  const { type, styles = {} } = block;

  switch (type) {
    case BLOCK_TYPES.HEADING: {
      return `<mj-text
        font-size="${styles.fontSize || '24px'}"
        font-weight="${styles.fontWeight || 'bold'}"
        align="${styles.textAlign || 'center'}"
        color="${styles.color || '#333333'}"
        padding="${styles.padding || '10px'}">
        <h${block.level || 2}>${escapeHtml(block.content || '')}</h${block.level || 2}>
      </mj-text>`;
    }

    case BLOCK_TYPES.TEXT:
    case BLOCK_TYPES.PARAGRAPH: {
      return `<mj-text
        font-size="${styles.fontSize || '16px'}"
        font-weight="${styles.fontWeight || 'normal'}"
        align="${styles.textAlign || 'left'}"
        color="${styles.color || '#333333'}"
        line-height="${styles.lineHeight || '1.5'}"
        padding="${styles.padding || '10px'}">
        ${escapeHtml(block.content || '')}
      </mj-text>`;
    }

    case BLOCK_TYPES.IMAGE: {
      const width = styles.width || '100%';
      const align = styles.alignment || 'center';

      if (block.link) {
        return `<mj-image
          src="${block.src || ''}"
          alt="${escapeHtml(block.alt || '')}"
          width="${width}"
          align="${align}"
          padding="${styles.padding || '10px'}"
          border-radius="${styles.borderRadius || '0px'}"
          href="${block.link}" />`;
      }

      return `<mj-image
        src="${block.src || ''}"
        alt="${escapeHtml(block.alt || '')}"
        width="${width}"
        align="${align}"
        padding="${styles.padding || '10px'}"
        border-radius="${styles.borderRadius || '0px'}" />`;
    }

    case BLOCK_TYPES.BUTTON: {
      return `<mj-button
        background-color="${styles.backgroundColor || '#815374'}"
        color="${styles.color || '#ffffff'}"
        font-size="${styles.fontSize || '16px'}"
        font-weight="${styles.fontWeight || 'bold'}"
        border-radius="${styles.borderRadius || '4px'}"
        padding="${styles.padding || '10px'}"
        href="${block.link || '#'}">
        ${escapeHtml(block.text || 'Click Here')}
      </mj-button>`;
    }

    case BLOCK_TYPES.DIVIDER: {
      return `<mj-divider
        border-color="${styles.borderColor || '#e0e0e0'}"
        border-width="${styles.borderWidth || '1px'}"
        border-style="${styles.borderStyle || 'solid'}"
        padding="${styles.padding || '10px 0'}" />`;
    }

    case BLOCK_TYPES.SPACER: {
      return `<mj-spacer height="${styles.height || '20px'}" />`;
    }

    case BLOCK_TYPES.SECTION: {
      const childrenMjml = (block.children || []).map((child) => blockToMjml(child)).join('\n');
      return `<mj-section
        background-color="${styles.backgroundColor || '#ffffff'}"
        padding="${styles.padding || '20px'}"
        border-radius="${styles.borderRadius || '0'}">
        <mj-column>
          ${childrenMjml}
        </mj-column>
      </mj-section>`;
    }

    case BLOCK_TYPES.COLUMNS: {
      const columns = block.columns || [];
      const columnsMjml = columns
        .map((col) => {
          const colContent = col.blocks.map((b) => blockToMjml(b)).join('\n');
          return `<mj-column>
            ${colContent}
          </mj-column>`;
        })
        .join('\n');

      return `<mj-section padding="${styles.padding || '10px'}">
        ${columnsMjml}
      </mj-section>`;
    }

    case BLOCK_TYPES.SOCIAL: {
      const platforms = block.platforms || [];
      const socialLinks = platforms
        .filter((p) => p.url)
        .map((platform) => {
          return `<mj-social-element name="${platform.type}" href="${platform.url}" />`;
        })
        .join('\n');

      return `<mj-social
        font-size="15px"
        icon-size="${styles.iconSize || '30px'}"
        mode="horizontal"
        padding="${styles.padding || '10px'}"
        align="${styles.alignment || 'center'}">
        ${socialLinks}
      </mj-social>`;
    }

    case BLOCK_TYPES.VIDEO: {
      if (!block.videoUrl) return '';

      // MJML doesn't support video directly, use image with link
      if (block.thumbnail) {
        return `<mj-image
          src="${block.thumbnail}"
          alt="Video thumbnail"
          href="${block.videoUrl}"
          padding="${styles.padding || '10px'}" />`;
      }

      return '';
    }

    case BLOCK_TYPES.HTML: {
      return `<mj-raw>
        ${block.htmlContent || ''}
      </mj-raw>`;
    }

    default:
      return '';
  }
};

/**
 * Convert blocks to complete MJML document
 */
export const blocksToMjml = (blocks, settings = {}) => {
  const {
    width = '600px',
    backgroundColor = '#f4f4f4',
    contentBackgroundColor = '#ffffff',
    fontFamily = 'Arial, sans-serif',
    preheaderText = '',
  } = settings;

  // Group blocks into sections for MJML structure
  const mjmlContent = blocks.map((block) => {
    if (block.type === BLOCK_TYPES.SECTION || block.type === BLOCK_TYPES.COLUMNS) {
      return blockToMjml(block);
    }
    // Wrap non-section blocks in a section
    return `<mj-section background-color="${contentBackgroundColor}">
      <mj-column>
        ${blockToMjml(block)}
      </mj-column>
    </mj-section>`;
  }).join('\n');

  return `<mjml>
  <mj-head>
    <mj-title>Email Campaign</mj-title>
    ${preheaderText ? `<mj-preview>${escapeHtml(preheaderText)}</mj-preview>` : ''}
    <mj-attributes>
      <mj-all font-family="${fontFamily}" />
      <mj-body background-color="${backgroundColor}" />
      <mj-section background-color="${contentBackgroundColor}" />
    </mj-attributes>
    <mj-style>
      .main-content { max-width: ${width}; }
    </mj-style>
  </mj-head>
  <mj-body width="${width}">
    ${mjmlContent}
  </mj-body>
</mjml>`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      document.body.removeChild(textarea);
      return false;
    }
  }
};

/**
 * Download file
 */
export const downloadFile = (content, filename, mimeType = 'text/html') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export helpers
 */
export const exportAsHtml = (blocks, settings, filename = 'campaign.html') => {
  const html = blocksToHtml(blocks, settings, true);
  downloadFile(html, filename, 'text/html');
  return html;
};

export const exportAsMjml = (blocks, settings, filename = 'campaign.mjml') => {
  const mjml = blocksToMjml(blocks, settings);
  downloadFile(mjml, filename, 'text/plain');
  return mjml;
};

export const exportAsWebHtml = (blocks, settings, filename = 'campaign-web.html') => {
  const html = blocksToHtml(blocks, settings, false);
  downloadFile(html, filename, 'text/html');
  return html;
};

export default {
  blocksToHtml,
  blocksToMjml,
  copyToClipboard,
  downloadFile,
  exportAsHtml,
  exportAsMjml,
  exportAsWebHtml,
};
