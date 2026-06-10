import { PrismaClient, GuidelineCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding submission guidelines...');

  const journalTitle = `IJARCM – INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE & MANAGEMENT
(A Peer-Reviewed, Refereed, Open-Access International Journal)`;

  const journalScope = `The International Journal of Academic Research in Commerce & Management (IJARCM) publishes original, high-quality, and contemporary research papers, conceptual studies, case analyses, and empirical works in the domains of Commerce, Management, Economics, and Interdisciplinary Business Research.
The journal's mission is to promote innovative scholarship, foster global academic exchange, and provide a platform for both academicians and practitioners to disseminate knowledge that contributes to sustainable business and management development.`;

  const typesOfPapers = `IJARCM welcomes a wide range of scholarly contributions that promote academic excellence and practical relevance. The following categories of manuscripts are accepted for publication:
1.	Original Research Papers – Analytical or empirical investigations contributing new knowledge or insights to the fields of commerce and management.
2.	Review Articles – Comprehensive evaluations and syntheses of previous research on relevant themes.
3.	Case Studies – Detailed analyses of business organizations, economic environments, or public policy implementations.
4.	Conceptual Papers – Theoretical explorations, frameworks, or models proposing new perspectives.
5.	Short Communications / Book Reviews – Concise academic reflections, opinions, or scholarly updates.`;

  const submissionChannels = `Authors can submit their manuscripts through either of the following methods:
•	Email Submission:
Send your manuscript as a Microsoft Word (.docx) file to:
📧 editor@ijarcm.com
•	Online Portal Submission:
Submit directly through the journal's online submission system at:
🌐 www.ijarcm.com/submission`;

  const documentsRequired = `Each submission must be accompanied by:
1.	The complete manuscript file in Microsoft Word (.docx) format.
2.	A Declaration of Originality confirming that the work is unpublished and not under review elsewhere.
3.	(Optional) A Plagiarism Report generated via Turnitin or iThenticate (recommended below 10% similarity).`;

  const documentLayout = `Element	Specification
Paper Size	A4 (210 × 297 mm)
Page Orientation	Portrait
Margins	1 inch on all four sides (Top, Bottom, Left, Right)
Line Spacing	1.5 for main text; single spacing for tables, figures, and references
Text Alignment	Justified (no left or right uneven edges)
Paragraph Style	Continuous paragraphs without indentation or line gaps
Columns	Single column format only
Page Number	Bottom center (12 pt)
Header/Footer	Header: Journal Title with Volume & Issue; Footer: © IJARCM`;

  const fontTypography = `Section	Font Type	Font Size	Style
Paper Title	Times New Roman	16 pt	Bold, Title Case, Centered
Author Name(s)	Times New Roman	12 pt	Bold, Centered
Affiliation(s)	Times New Roman	11 pt	Italic, Centered
Headings (Main Sections)	Times New Roman	13.5 pt	Bold, Left Aligned
Subheadings (if used)	Times New Roman	12 pt	Bold Italic
Body Text	Times New Roman	12 pt	Regular
Keywords / Abstract Label	Times New Roman	12 pt	Bold
Tables / Figures Captions	Times New Roman	11 pt	Italic, Centered Below Figure/Table`;

  const paragraphGuidelines = `•	Avoid extra spaces before or after paragraphs.
•	Do not use numbering or bullets inside paragraphs unless absolutely necessary.
•	Maintain uniform justification throughout the document.
•	Avoid color text; black text only on white background.`;

  const paperStructure = `All manuscripts submitted to the International Journal of Academic Research in Commerce & Management (IJARCM) must follow a uniform structure to ensure consistency, clarity, and professional presentation. Authors are required to organize their papers according to the following format:
1. Title Page
The title page must contain the following details:
•	Title of the Paper: Concise, specific, and relevant to the study (Times New Roman, 16 pt, Bold, Centered, Title Case).
•	Author(s) Full Name(s): Include all contributing authors (Times New Roman, 12 pt, Bold, Centered).
•	Designation and Institutional Affiliation: Mention department, institution, city, and country (Times New Roman, 11 pt, Italic, Centered).
•	Corresponding Author's Email: Provide only one email ID for correspondence.
Example:
Dr. Ritu Sharma
Associate Professor, Department of Management Studies, University of Delhi, India
📧 ritu.sharma@du.ac.in
2. Abstract
The abstract should provide a clear and concise summary of the research problem, objectives, methodology, key results, and conclusions. It should be written in a single paragraph without subheadings.
•	Word Limit: 150–250 words
•	Font: Times New Roman, 12 pt, Justified alignment
•	Spacing: Single line spacing
•	Keywords: 4–6 keywords should appear immediately below the abstract, separated by commas.
Example:
Abstract:
This study examines the influence of generative artificial intelligence (AI) on strategic business decision-making and its implications for innovation, forecasting, and resource allocation. Using a mixed-method approach combining literature review and case analysis, the paper identifies how AI-driven insights enhance creativity, efficiency, and risk management within organizations, particularly in the Indian business context.
Keywords: Generative AI, Business Strategy, Decision-Making, Innovation, Digital Transformation
3. Main Body of the Paper
The main text of the manuscript must be divided into the following major sections:
(a) Introduction
Provide the background, significance, research problem, and objectives of the study. Clearly explain the motivation for the research and its expected contribution to the field.
(b) Literature Review
Critically summarize and analyze previous research relevant to the topic. Identify existing gaps, theoretical frameworks, and areas where the current study advances knowledge.
(c) Research Objectives
Clearly define the aims and specific objectives that guide the research process.
(d) Research Methodology
Explain the research design, data collection methods, sampling techniques, statistical tools, and analytical approaches used in the study. Ensure transparency and reproducibility.
(e) Data Analysis and Interpretation
Present the analyzed data systematically using tables, figures, and graphs. Interpret the results logically, correlating them with theoretical or empirical evidence.
(f) Findings and Discussion
Discuss the outcomes of the study in depth, compare them with existing literature, and highlight the implications for academia, industry, or policy.
(g) Conclusion and Recommendations
Summarize the key findings, draw overall conclusions, and provide practical or theoretical recommendations. Mention possible directions for future research.
(h) References
List all sources cited in the text following APA (7th edition) or MLA (9th edition) format. References should preferably be from authentic and recent sources (2018–2025).
4. Word Count and Length Requirements
Section	Recommended Word Count
Abstract	200–250 words
Each Major Section	1000–1500 words
Total Paper Length	4000–8000 words (including tables, figures, and references)
________________________________________
5. Additional Presentation Notes
•	Avoid numbering main headings (e.g., write Introduction, not 1. Introduction).
•	Maintain a continuous paragraph style — no unnecessary line breaks between paragraphs.
•	Do not use colored text; all text must be in black on white background.
•	Use consistent terminology and formal academic tone throughout.`;

  const tablesFormatting = `•	All tables must be numbered sequentially in the order they appear in the text (e.g., Table 1, Table 2, etc.).
•	The title of the table should appear above the table, in Times New Roman, 11 pt, Bold Italic, Centered.
•	Tables should be referenced in the main text (for example, as shown in Table 2).
•	Use single line spacing inside tables, with clear borders for rows and columns.
•	Avoid vertical lines; horizontal lines should be used only where necessary.
•	Data in the tables must be aligned properly (usually centered or right-aligned for numeric values).
•	Each table should be self-explanatory, containing all abbreviations or symbols defined in the note below the table.
Example format:
Table 1: Sector-wise Growth of E-commerce in India (2018–2024)
Year	Retail	Travel	Services	Total (%)
2018	18.2	22.5	10.4	17.0
2020	24.5	27.0	14.8	21.5
2024	31.0	32.6	19.3	27.2
Source: Author's Compilation (2024)`;

  const figuresFormatting = `•	All figures, graphs, and charts must be high-resolution images (minimum 300 DPI) in JPG or PNG format.
•	Figures must be numbered consecutively (e.g., Figure 1, Figure 2, etc.).
•	Figure caption should be placed below the figure (Times New Roman, 11 pt, Italic, Centered).
•	Each figure must be referenced within the text (e.g., as illustrated in Figure 3).
•	Avoid excessive coloring or decorative backgrounds.
•	Graphs should have clearly labeled axes and units of measurement.
•	Ensure visual clarity when using multiple lines or bars in one figure (use different patterns or shades).
Example format:
Figure 1: Adoption of Generative AI Tools Across Business Sectors (2020–2025)
(Source: McKinsey Global Institute, 2024)`;

  const equationsFormatting = `•	Equations must be written using Microsoft Equation Editor or a similar compatible tool.
•	Equations should be numbered sequentially (e.g., Equation 1, Equation 2, etc.), aligned to the right margin.
•	Variables must be clearly defined immediately after the equation.
•	Use italics for variables and normal font for mathematical functions.
Example format:
ROI = (Net Profit / Total Investment) × 100
Where ROI denotes Return on Investment.`;

  const citationStyle = `IJARCM accepts both APA (7th Edition) and MLA (9th Edition) citation styles. Authors should consistently follow one style throughout the manuscript.
In-text Citations (APA Examples)
•	Single Author: (Brynjolfsson, 2017)
•	Two Authors: (Davenport & Ronanki, 2018)
•	Three or More Authors: (Bommasani et al., 2020)
•	Multiple Citations: (McKinsey Global Institute, 2020; NASSCOM, 2021)
•	Direct Quote: "AI is reshaping business strategies" (O'Neil, 2016, p. 45).
In-text Citations (MLA Examples)
•	(Brynjolfsson 25)
•	(Davenport and Ronanki 62)
•	(Bommasani et al. 14)
•	(McKinsey Global Institute 2020; NASSCOM 2021)`;

  const referenceFormatting = `APA Style Example
Brynjolfsson, E., & McAfee, A. (2017). Machine, Platform, Crowd: Harnessing Our Digital Future. Norton.
Davenport, T., & Ronanki, R. (2018). Artificial Intelligence for the Real World. Harvard Business Review.
O'Neil, C. (2016). Weapons of Math Destruction. Crown.
McKinsey Global Institute. (2020). The State of AI in 2020. McKinsey Report.
MLA Style Example
Brynjolfsson, Erik, and Andrew McAfee. Machine, Platform, Crowd: Harnessing Our Digital Future. Norton, 2017.
Davenport, Thomas, and Rajeev Ronanki. "Artificial Intelligence for the Real World." Harvard Business Review, 2018.
O'Neil, Cathy. Weapons of Math Destruction. Crown, 2016.
McKinsey Global Institute. The State of AI in 2020. McKinsey, 2020.`;

  const referenceQuality = `•	Authors should include a minimum of 20–30 authentic references from academic books, journals, and conference papers.
•	Recent publications (2018–2025) are strongly recommended.
•	Avoid citing Wikipedia, blogs, or unverified web sources.
•	All references cited in the text must appear in the reference list and vice versa.`;

  const plagiarismPolicy = `IJARCM follows strict anti-plagiarism protocols to ensure originality of content.
•	The maximum allowable similarity index is 10%.
•	Every submission will be screened using Turnitin or iThenticate software.
•	Paraphrasing without citation, self-plagiarism, or copying from previously published work is strictly prohibited.
•	Manuscripts exceeding the plagiarism limit will be rejected immediately or sent back for revision.
Declaration Requirement:
Each author must submit a signed statement confirming that the manuscript is original, unpublished, and not under review in any other journal.`;

  const ethicalPolicy = `IJARCM upholds the ethical principles outlined by the Committee on Publication Ethics (COPE) and ensures responsible research practices.
Authors Must Ensure:
•	The work is original and free from fabrication or falsification of data.
•	Proper acknowledgment is given to all contributors and funding sources.
•	Conflicts of interest, if any, are transparently disclosed.
•	Research involving human participants complies with ethical clearance and informed consent norms.
Editors & Reviewers Commit To:
•	Maintain confidentiality of submitted manuscripts.
•	Conduct unbiased, constructive, and timely peer reviews.
•	Avoid any conflict of interest or plagiarism-related issues.`;

  const misconductConsequences = `If plagiarism, falsification, or unethical conduct is detected:
•	The paper will be immediately rejected or retracted (if published).
•	Authors may be blacklisted from future submissions.
•	Institutions may be informed of the misconduct, if necessary.`;

  const acknowledgmentFunding = `Authors must acknowledge all financial or institutional support that contributed to the research and mention any grants, fellowships, or collaborations.
Example:
This research was supported by the Department of Commerce, University of Delhi, under the Faculty Research Grant (2024–25).`;

  const peerReviewPolicy = `All manuscripts submitted to IJARCM undergo a double-blind peer-review process. This ensures that both the author and reviewers remain anonymous to maintain fairness and impartiality.
Review Process Steps
1.	Initial Screening:
Each submission is first evaluated by the Editorial Board for relevance, originality, scope alignment, and formatting compliance. Manuscripts not meeting the basic criteria may be returned to the author for revision or rejection before review.
2.	Double-Blind Review:
Accepted manuscripts are sent to at least two independent reviewers who are experts in the relevant field. The reviewers evaluate the paper on the basis of:
o	Academic originality and novelty
o	Clarity of objectives and methodology
o	Accuracy of data and analysis
o	Relevance and significance of findings
o	Structure, references, and contribution to the discipline
3.	Review Duration:
The review process usually takes 4–6 weeks. Authors may be requested to revise their papers based on reviewer comments.
4.	Decision Categories:
o	Accept as it is
o	Accept with Minor Revisions
o	Revise and Resubmit (Major Revisions)
o	Reject
5.	Final Decision:
The final decision regarding acceptance or rejection rests solely with the Editor-in-Chief, based on reviewers' recommendations and editorial judgment.`;

  const copyrightPolicy = `IJARCM believes in promoting intellectual freedom while ensuring appropriate author rights and legal protection.
Copyright Ownership
•	Authors retain full copyright of their published papers.
•	Upon acceptance, authors grant IJARCM the non-exclusive right to publish, distribute, and archive the paper in any format (print, online, or digital).
•	Authors are free to reuse or republish their work elsewhere, provided the original publication in IJARCM is properly cited.
License
All published works are licensed under the Creative Commons Attribution 4.0 International (CC BY 4.0) License.
This license allows:
•	Sharing — copying, distributing, and transmitting the work.
•	Adapting — remixing, transforming, and building upon the work.
•	Attribution — credit must be given to the original author and the journal (IJARCM).
Example License Line for Published Papers:
© 2025 Author(s). This article is distributed under the terms of the Creative Commons Attribution 4.0 International License (CC BY 4.0).`;

  const openAccessPolicy = `IJARCM is an Open Access, Peer-Reviewed, and Refereed International Journal.
All published papers are freely available online to readers worldwide without any subscription or registration charges.
Benefits of Open Access:
•	Global visibility and wider citation impact.
•	Free and immediate access to published research.
•	Accelerated dissemination of knowledge among academics, industry professionals, and policymakers.
•	Long-term preservation of published articles in digital repositories.
Archiving and Indexing
All accepted articles are permanently archived in the IJARCM database and indexed in reputed digital repositories and citation systems to ensure accessibility and global reach.`;

  const publicationCharges = `Author Category	Publication Fee	Inclusions
Indian Authors	₹4500 per accepted paper	Covers peer review, DOI assignment, open-access hosting, digital certificate, and indexing.
Foreign Authors	USD per accepted paper	Covers international review, DOI, and global access hosting.
Important Notes:
•	There are no submission or processing fees prior to acceptance.
•	Charges are applicable only after final acceptance of the paper.
•	Payment receipts and publication certificates are issued within 7 working days of publication.
•	Fee Waivers may be considered for outstanding research papers, doctoral scholars, or under collaborative institutional projects.`;

  const paperLengthRequirements = `To maintain quality and depth of analysis, IJARCM recommends the following structure and word count:
Section	Recommended Word Count
Abstract	200–250 words
Introduction	1000–1500 words
Literature Review	1000–1500 words
Research Objectives	1000–1200 words
Methodology	1000–1200 words
Data Analysis & Interpretation	1000–1500 words
Findings & Discussion	1000–1500 words
Conclusion & Recommendations	500–1000 words
References	Minimum 20–30 citations
Total Word Count	4000–8000 words (maximum 10,000 words accepted)
Short Research Notes and Case Studies may be accepted with a word limit between 2500–4000 words.`;

  const filePreparation = `File Format
•	All manuscripts must be submitted in Microsoft Word (.doc or .docx) format only.
•	PDF submissions are not accepted at the initial stage.
Cover Letter
Each submission should include a short cover letter addressed to the Editor-in-Chief, stating:
•	Paper title
•	Type of submission (Research Paper / Review / Case Study)
•	Declaration of originality and authorship
•	Corresponding author's full contact details (email, phone, address)`;

  const declarationAuthorship = `•	Authors must confirm that the paper is original, unpublished, and not under review elsewhere.
•	All contributing authors must be properly credited.
•	In case of multiple authors, a corresponding author must be clearly identified.
•	The corresponding author is responsible for all communications with the journal during and after review.`;

  const submissionProcedure = `Authors can submit their manuscripts through the following modes:
Email Submission
📧 Send your manuscript to: editor@ijarcm.com
Subject line: Paper Submission – [Your Paper Title]
Online Portal Submission
🌐 Upload via: www.ijarcm.com/submission`;

  const publicationTimeline = `Process Stage	Duration
Acknowledgment of Submission	2–3 working days
Double-Blind Peer Review	4–6 weeks
Revision Period (if applicable)	1–2 weeks
Final Acceptance Notification	Within 60 days of submission
Publication (Online & Print)	Within 7–10 days post-acceptance`;

  const proofreadingPolicy = `Editorial Proofreading
•	Once a paper is accepted, the editorial team conducts initial proofreading for grammar, formatting, and layout consistency.
•	The content is also checked for adherence to IJARCM's style guide (font, spacing, headers, and references).
•	Minor grammatical or typographical corrections are made directly by the editorial team.
Author Proofreading
•	A proof copy (galley proof) is sent to the corresponding author before final publication.
•	Authors are expected to review the proof carefully for factual accuracy, spelling errors, figure/table placement, and reference formatting.
•	Only minor corrections (typographical or formatting) are allowed at this stage; major changes in content or data are not permitted.
•	Authors must return the corrected proof within 3 working days of receipt.
Final Approval
•	Publication proceeds only after the author's final approval of the proof version.
•	The approved version is considered final and cannot be modified post-publication except through official correction notices.`;

  const authorCertificates = `•	Upon publication, authors receive a soft copy of the Publication Certificate within 7 working days.
•	The certificate includes the paper title, author details, journal issue, DOI number, and publication date.
•	Authors can freely access and download their paper from the official website (www.ijarcm.com) without any login or subscription requirement.
•	The published papers are globally visible, indexed, and permanently archived in the IJARCM digital repository.`;

  const correctionRetraction = `IJARCM follows transparent post-publication correction procedures in line with COPE (Committee on Publication Ethics) guidelines.
Corrections
Minor errors that do not affect the overall findings of the paper (e.g., spelling or data formatting errors) will be corrected online with a correction notice linked to the original article.
Addendums
If authors wish to provide additional information or clarification related to their paper, they may request an addendum, subject to editorial approval.
Retractions
Serious ethical violations (e.g., plagiarism, falsification, duplicate submission) will result in paper retraction.
A retraction statement explaining the reason will be published in the next journal issue and permanently linked to the original article.`;

  const contactInformation = `Editor-in-Chief
International Journal of Academic Research in Commerce & Management (IJARCM)
📧 Email: editor@ijarcm.com
🌐 Website: www.ijarcm.com
🏛️ ISSN (Online): 2395-6410
📘 ISSN (Print): 2455-0116
For all queries related to manuscript submission, review status, publication fee, or editorial correspondence, authors may contact the editorial office directly via email.
Response time is typically within 48 hours on working days.`;

  // Create submission guidelines entries
  const guidelines = [
    {
      title: "Journal Title and Scope",
      content: `${journalTitle}\n\nScope of the Journal:\n${journalScope}`,
      category: "GENERAL",
      displayOrder: 1
    },
    {
      title: "Types of Papers and Submission Channels",
      content: `Types of Manuscripts Accepted\n${typesOfPapers}\n\nSubmission Channels\n${submissionChannels}\n\nDocuments to be Included with Submission\n${documentsRequired}`,
      category: "SUBMISSION_PROCESS",
      displayOrder: 2
    },
    {
      title: "General Formatting Guidelines",
      content: `Document Layout\n${documentLayout}\n\nFont and Typography\n${fontTypography}\n\nParagraph Guidelines\n${paragraphGuidelines}`,
      category: "FORMATTING",
      displayOrder: 3
    },
    {
      title: "Paper Structure",
      content: paperStructure,
      category: "TECHNICAL_REQUIREMENTS",
      displayOrder: 4
    },
    {
      title: "Tables, Figures, and Equations Formatting",
      content: `Tables\n${tablesFormatting}\n\nFigures and Charts\n${figuresFormatting}\n\nEquations\n${equationsFormatting}`,
      category: "FORMATTING",
      displayOrder: 5
    },
    {
      title: "Citation and Referencing Style",
      content: `Citation Style\n${citationStyle}\n\nReference List Formatting\n${referenceFormatting}\n\nReference Quality\n${referenceQuality}`,
      category: "TECHNICAL_REQUIREMENTS",
      displayOrder: 6
    },
    {
      title: "Plagiarism and Ethical Policy",
      content: `Plagiarism Policy\n${plagiarismPolicy}\n\nEthical Policy\n${ethicalPolicy}\n\nConsequences of Misconduct\n${misconductConsequences}\n\nAcknowledgment and Funding Disclosure\n${acknowledgmentFunding}`,
      category: "ETHICAL_GUIDELINES",
      displayOrder: 7
    },
    {
      title: "Peer Review Process",
      content: peerReviewPolicy,
      category: "REVIEW_PROCESS",
      displayOrder: 8
    },
    {
      title: "Copyright and Open Access Policy",
      content: `Copyright Policy\n${copyrightPolicy}\n\nOpen Access Policy\n${openAccessPolicy}`,
      category: "GENERAL",
      displayOrder: 9
    },
    {
      title: "Publication Charges and Paper Length",
      content: `Publication Charges\n${publicationCharges}\n\nPaper Length and Word Limit\n${paperLengthRequirements}`,
      category: "SUBMISSION_PROCESS",
      displayOrder: 10
    },
    {
      title: "File Preparation and Submission Requirements",
      content: `File Preparation and Submission Format\n${filePreparation}\n\nDeclaration and Authorship\n${declarationAuthorship}\n\nPlagiarism and Similarity Report\n${submissionProcedure}\n\nSubmission Procedure\n${submissionProcedure}`,
      category: "SUBMISSION_PROCESS",
      displayOrder: 11
    },
    {
      title: "Publication Timeline",
      content: publicationTimeline,
      category: "SUBMISSION_PROCESS",
      displayOrder: 12
    },
    {
      title: "Proofreading, Final Publication and Post-Publication Policies",
      content: `Proofreading Policy\n${proofreadingPolicy}\n\nAuthor Certificates and Access\n${authorCertificates}\n\nCorrection, Retraction, and Addendum Policy\n${correctionRetraction}`,
      category: "GENERAL",
      displayOrder: 13
    },
    {
      title: "Contact Information",
      content: contactInformation,
      category: "GENERAL",
      displayOrder: 14
    }
  ];

  for (const guideline of guidelines) {
    // First check if a guideline with this title already exists
    const existingGuideline = await prisma.submissionGuideline.findFirst({
      where: { title: guideline.title }
    });

    if (existingGuideline) {
      // Update existing guideline
      await prisma.submissionGuideline.update({
        where: { id: existingGuideline.id },
        data: { content: guideline.content }
      });
      console.log(`✅ Updated submission guideline: ${guideline.title}`);
    } else {
      // Create new guideline
      await prisma.submissionGuideline.create({
        data: {
          title: guideline.title,
          content: guideline.content,
          category: guideline.category as GuidelineCategory,
          displayOrder: guideline.displayOrder,
          isPublished: true
        }
      });
      console.log(`✅ Created submission guideline: ${guideline.title}`);
    }
  }

  console.log('✅ Submission guidelines seeding completed successfully! 🎉');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });