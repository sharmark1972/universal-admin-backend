export interface CitationData {
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  accessDate?: Date;
  publisher?: string;
  location?: string;
}

export enum CitationStyle {
  APA = 'APA',
  MLA = 'MLA',
  CHICAGO = 'CHICAGO',
  IEEE = 'IEEE',
  HARVARD = 'HARVARD',
  BIBTEX = 'BIBTEX'
}

export class CitationGenerator {
  static generate(data: CitationData, style: CitationStyle): string {
    switch (style) {
      case CitationStyle.APA:
        return this.generateAPA(data);
      case CitationStyle.MLA:
        return this.generateMLA(data);
      case CitationStyle.CHICAGO:
        return this.generateChicago(data);
      case CitationStyle.IEEE:
        return this.generateIEEE(data);
      case CitationStyle.HARVARD:
        return this.generateHarvard(data);
      case CitationStyle.BIBTEX:
        return this.generateBibTeX(data);
      default:
        return this.generateAPA(data);
    }
  }

  private static generateAPA(data: CitationData): string {
    const authors = this.formatAuthorsAPA(data.authors);
    const year = `(${data.year})`;
    const title = `${data.title}.`;
    
    let citation = `${authors} ${year}. ${title}`;
    
    if (data.journal) {
      citation += ` *${data.journal}*`;
      if (data.volume) {
        citation += `, *${data.volume}*`;
        if (data.issue) {
          citation += `(${data.issue})`;
        }
      }
      if (data.pages) {
        citation += `, ${data.pages}`;
      }
      citation += '.';
    }
    
    if (data.doi) {
      citation += ` https://doi.org/${data.doi}`;
    } else if (data.url) {
      citation += ` ${data.url}`;
    }
    
    return citation;
  }

  private static generateMLA(data: CitationData): string {
    const authors = this.formatAuthorsMLA(data.authors);
    const title = `"${data.title}."`;
    
    let citation = `${authors} ${title}`;
    
    if (data.journal) {
      citation += ` *${data.journal}*`;
      if (data.volume) {
        citation += `, vol. ${data.volume}`;
        if (data.issue) {
          citation += `, no. ${data.issue}`;
        }
      }
      citation += `, ${data.year}`;
      if (data.pages) {
        citation += `, pp. ${data.pages}`;
      }
      citation += '.';
    }
    
    if (data.url) {
      citation += ` Web.`;
      if (data.accessDate) {
        const accessDate = data.accessDate.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        citation += ` ${accessDate}.`;
      }
    }
    
    return citation;
  }

  private static generateChicago(data: CitationData): string {
    const authors = this.formatAuthorsChicago(data.authors);
    const title = `"${data.title}."`;
    
    let citation = `${authors} ${title}`;
    
    if (data.journal) {
      citation += ` *${data.journal}*`;
      if (data.volume) {
        citation += ` ${data.volume}`;
        if (data.issue) {
          citation += `, no. ${data.issue}`;
        }
      }
      citation += ` (${data.year})`;
      if (data.pages) {
        citation += `: ${data.pages}`;
      }
      citation += '.';
    }
    
    if (data.doi) {
      citation += ` https://doi.org/${data.doi}.`;
    } else if (data.url) {
      citation += ` ${data.url}.`;
    }
    
    return citation;
  }

  private static generateIEEE(data: CitationData): string {
    const authors = this.formatAuthorsIEEE(data.authors);
    const title = `"${data.title},"`;
    
    let citation = `${authors} ${title}`;
    
    if (data.journal) {
      citation += ` *${data.journal}*`;
      if (data.volume) {
        citation += `, vol. ${data.volume}`;
        if (data.issue) {
          citation += `, no. ${data.issue}`;
        }
      }
      if (data.pages) {
        citation += `, pp. ${data.pages}`;
      }
      citation += `, ${data.year}.`;
    }
    
    if (data.doi) {
      citation += ` doi: ${data.doi}.`;
    }
    
    return citation;
  }

  private static generateHarvard(data: CitationData): string {
    const authors = this.formatAuthorsHarvard(data.authors);
    const year = data.year;
    const title = `'${data.title}'`;
    
    let citation = `${authors} ${year}, ${title}`;
    
    if (data.journal) {
      citation += `, *${data.journal}*`;
      if (data.volume) {
        citation += `, vol. ${data.volume}`;
        if (data.issue) {
          citation += `, no. ${data.issue}`;
        }
      }
      if (data.pages) {
        citation += `, pp. ${data.pages}`;
      }
      citation += '.';
    }
    
    if (data.url && data.accessDate) {
      const accessDate = data.accessDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      citation += ` Available at: ${data.url} (Accessed: ${accessDate}).`;
    }
    
    return citation;
  }

  private static generateBibTeX(data: CitationData): string {
    const authors = this.formatAuthorsBibTeX(data.authors);
    const year = data.year;
    const title = this.escapeBibTeX(data.title);
    const journal = data.journal ? this.escapeBibTeX(data.journal) : '';
    const volume = data.volume || '';
    const number = data.issue || '';
    const pages = data.pages || '';
    const doi = data.doi || '';
    const url = data.url || '';
    
    // Generate a citation key from first author's last name and year
    const firstAuthor = data.authors[0] || 'unknown';
    const lastName = firstAuthor.split(' ').pop() || 'unknown';
    const key = `${lastName.toLowerCase()}${year}`;
    
    let bibtex = `@article{${key},\n`;
    bibtex += `  author = {${authors}},\n`;
    bibtex += `  title = {${title}},\n`;
    bibtex += `  year = {${year}},\n`;
    
    if (journal) {
      bibtex += `  journal = {${journal}},\n`;
    }
    if (volume) {
      bibtex += `  volume = {${volume}},\n`;
    }
    if (number) {
      bibtex += `  number = {${number}},\n`;
    }
    if (pages) {
      bibtex += `  pages = {${pages}},\n`;
    }
    if (doi) {
      bibtex += `  doi = {${doi}},\n`;
    }
    if (url) {
      bibtex += `  url = {${url}},\n`;
    }
    
    // Remove trailing comma and newline
    bibtex = bibtex.slice(0, -2);
    bibtex += '\n}';
    
    return bibtex;
  }

  private static escapeBibTeX(text: string): string {
    return text
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  }

  private static formatAuthorsBibTeX(authors: string[]): string {
    if (authors.length === 0) return '';
    
    return authors.map(author => {
      const parts = author.trim().split(' ');
      if (parts.length < 2) return author;
      
      const lastName = parts[parts.length - 1];
      const firstNames = parts.slice(0, -1).join(' ');
      
      return `${lastName}, ${firstNames}`;
    }).join(' and ');
  }

  private static formatAuthorsAPA(authors: string[]): string {
    if (authors.length === 0) return '';
    if (authors.length === 1) return this.formatAuthorLastFirst(authors[0]);
    if (authors.length === 2) {
      return `${this.formatAuthorLastFirst(authors[0])} & ${this.formatAuthorLastFirst(authors[1])}`;
    }
    
    const formattedAuthors = authors.slice(0, -1).map(author => this.formatAuthorLastFirst(author));
    return `${formattedAuthors.join(', ')}, & ${this.formatAuthorLastFirst(authors[authors.length - 1])}`;
  }

  private static formatAuthorsMLA(authors: string[]): string {
    if (authors.length === 0) return '';
    if (authors.length === 1) return this.formatAuthorLastFirst(authors[0]);
    if (authors.length === 2) {
      return `${this.formatAuthorLastFirst(authors[0])} and ${authors[1]}`;
    }
    
    const firstAuthor = this.formatAuthorLastFirst(authors[0]);
    return `${firstAuthor}, et al.`;
  }

  private static formatAuthorsChicago(authors: string[]): string {
    if (authors.length === 0) return '';
    if (authors.length === 1) return this.formatAuthorLastFirst(authors[0]);
    if (authors.length === 2) {
      return `${this.formatAuthorLastFirst(authors[0])} and ${authors[1]}`;
    }
    
    const formattedAuthors = authors.slice(0, -1).map(author => this.formatAuthorLastFirst(author));
    return `${formattedAuthors.join(', ')}, and ${authors[authors.length - 1]}`;
  }

  private static formatAuthorsIEEE(authors: string[]): string {
    if (authors.length === 0) return '';
    if (authors.length === 1) return this.formatAuthorFirstLast(authors[0]);
    if (authors.length <= 6) {
      const formattedAuthors = authors.slice(0, -1).map(author => this.formatAuthorFirstLast(author));
      return `${formattedAuthors.join(', ')}, and ${this.formatAuthorFirstLast(authors[authors.length - 1])}`;
    }
    
    return `${this.formatAuthorFirstLast(authors[0])}, et al.`;
  }

  private static formatAuthorsHarvard(authors: string[]): string {
    if (authors.length === 0) return '';
    if (authors.length === 1) return this.formatAuthorLastFirst(authors[0]);
    if (authors.length === 2) {
      return `${this.formatAuthorLastFirst(authors[0])} & ${this.formatAuthorLastFirst(authors[1])}`;
    }
    
    return `${this.formatAuthorLastFirst(authors[0])} et al.`;
  }

  private static formatAuthorLastFirst(author: string): string {
    const parts = author.trim().split(' ');
    if (parts.length < 2) return author;
    
    const lastName = parts[parts.length - 1];
    const firstNames = parts.slice(0, -1).join(' ');
    return `${lastName}, ${firstNames}`;
  }

  private static formatAuthorFirstLast(author: string): string {
    const parts = author.trim().split(' ');
    if (parts.length < 2) return author;
    
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const middleNames = parts.slice(1, -1);
    
    let formatted = `${firstName.charAt(0)}.`;
    middleNames.forEach(name => {
      formatted += ` ${name.charAt(0)}.`;
    });
    formatted += ` ${lastName}`;
    
    return formatted;
  }
}

export function generateCitation(data: CitationData, style: CitationStyle): string {
  return CitationGenerator.generate(data, style);
}

export function extractAuthorsFromPaper(paperAuthors: any[]): string[] {
  return paperAuthors
    .sort((a, b) => a.authorOrder - b.authorOrder)
    .map(pa => `${pa.user.firstName} ${pa.user.lastName}`);
}

export function createCitationFromPaper(paper: any, style: CitationStyle = CitationStyle.APA): string {
  const authors = extractAuthorsFromPaper(paper.paperAuthors || []);
  
  const citationData: CitationData = {
    title: paper.title,
    authors,
    year: paper.publishedAt ? new Date(paper.publishedAt).getFullYear() : new Date().getFullYear(),
    journal: 'International Journal of Research in Applied Mathematics',
    doi: paper.doi,
    url: paper.url
  };
  
  return generateCitation(citationData, style);
}