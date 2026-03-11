import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  RemoveFormatting,
  Undo,
  Redo,
  Quote
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Convert Markdown to HTML
const convertMarkdownToHtml = (text: string): string => {
  let html = text;
  
  // Headers (must be at start of line)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Bold (** or __)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic (* or _)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
  
  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Unordered lists (- or *)
  const lines = html.split('\n');
  let inUl = false;
  let inOl = false;
  const processedLines: string[] = [];
  
  for (const line of lines) {
    const ulMatch = line.match(/^[\-\*] (.+)$/);
    const olMatch = line.match(/^\d+\. (.+)$/);
    
    if (ulMatch) {
      if (!inUl) {
        if (inOl) { processedLines.push('</ol>'); inOl = false; }
        processedLines.push('<ul>');
        inUl = true;
      }
      processedLines.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (!inOl) {
        if (inUl) { processedLines.push('</ul>'); inUl = false; }
        processedLines.push('<ol>');
        inOl = true;
      }
      processedLines.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inUl) { processedLines.push('</ul>'); inUl = false; }
      if (inOl) { processedLines.push('</ol>'); inOl = false; }
      
      const trimmed = line.trim();
      if (!trimmed) {
        processedLines.push('');
      } else if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) {
        processedLines.push(trimmed);
      } else if (trimmed.startsWith('>')) {
        processedLines.push(`<blockquote>${trimmed.substring(1).trim()}</blockquote>`);
      } else {
        processedLines.push(`<p>${trimmed}</p>`);
      }
    }
  }
  
  if (inUl) processedLines.push('</ul>');
  if (inOl) processedLines.push('</ol>');
  
  return processedLines.filter(Boolean).join('\n');
};

// Detect if text is Markdown
const isMarkdown = (text: string): boolean => {
  const markdownPatterns = [
    /^#{1,6} /m,
    /\*\*[^*]+\*\*/,
    /__[^_]+__/,
    /\*[^*]+\*/,
    /_[^_]+_/,
    /~~[^~]+~~/,
    /`[^`]+`/,
    /\[[^\]]+\]\([^)]+\)/,
    /^[\-\*] /m,
    /^\d+\. /m,
    /^> /m,
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[300px] p-4',
      },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;
        
        const htmlData = clipboardData.getData('text/html');
        const textData = clipboardData.getData('text/plain');
        
        // If HTML is present, let TipTap handle it naturally
        if (htmlData) {
          return false;
        }
        
        // If plain text and it's Markdown, convert it
        if (textData && isMarkdown(textData)) {
          event.preventDefault();
          const html = convertMarkdownToHtml(textData);
          editor?.commands.insertContent(html);
          return true;
        }
        
        return false;
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const getWordCount = useCallback(() => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }, [editor]);

  if (!editor) {
    return null;
  }

  const wordCount = getWordCount();

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-input bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-accent' : ''}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <div className="flex-1" />
        
        <span className={`text-xs px-2 py-1 rounded ${wordCount >= 700 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'text-muted-foreground'}`}>
          {wordCount} words {wordCount >= 700 && '✓'}
        </span>
      </div>
      
      {/* Editor Content with proper blog styling */}
      <div className="blog-editor-content">
        <EditorContent editor={editor} />
      </div>
      
      <style>{`
        .blog-editor-content .ProseMirror {
          min-height: 300px;
          padding: 1rem;
          outline: none;
        }
        
        .blog-editor-content .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        
        /* Heading styles with spacing */
        .blog-editor-content .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.2;
          color: inherit;
        }
        
        .blog-editor-content .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.3;
          color: inherit;
        }
        
        .blog-editor-content .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.4;
          color: inherit;
        }
        
        /* Paragraph spacing */
        .blog-editor-content .ProseMirror p {
          margin-bottom: 1.5rem;
          line-height: 1.7;
        }
        
        /* List styles */
        .blog-editor-content .ProseMirror ul,
        .blog-editor-content .ProseMirror ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .blog-editor-content .ProseMirror ul {
          list-style-type: disc;
        }
        
        .blog-editor-content .ProseMirror ol {
          list-style-type: decimal;
        }
        
        .blog-editor-content .ProseMirror li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }
        
        .blog-editor-content .ProseMirror li p {
          margin-bottom: 0;
        }
        
        /* Blockquote */
        .blog-editor-content .ProseMirror blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        /* Code */
        .blog-editor-content .ProseMirror code {
          background: hsl(var(--muted));
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }
        
        .blog-editor-content .ProseMirror pre {
          background: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }
        
        .blog-editor-content .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        
        /* Strong and emphasis */
        .blog-editor-content .ProseMirror strong {
          font-weight: 700;
        }
        
        .blog-editor-content .ProseMirror em {
          font-style: italic;
        }
        
        /* Links */
        .blog-editor-content .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        /* First heading should not have top margin */
        .blog-editor-content .ProseMirror > h1:first-child,
        .blog-editor-content .ProseMirror > h2:first-child,
        .blog-editor-content .ProseMirror > h3:first-child {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
}
