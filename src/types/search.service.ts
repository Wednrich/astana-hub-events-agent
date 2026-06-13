import * as fs from 'fs';
import * as path from 'path';
import { StaffData, StaffMember, RegionalHub, InstagramPost } from '../types';

export class SearchService {
  private staffData: StaffData;
  private postsData: InstagramPost[];

  constructor() {
    // Load local JSON data synchronously on startup
    const staffPath = path.join(__dirname, '../data/staff.json');
    const postsPath = path.resolve(__dirname, '../../../../dataset_instagram-scraper_2026-06-11_11-13-07-325.json');

    this.staffData = JSON.parse(fs.readFileSync(staffPath, 'utf-8'));
    this.postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
  }

  /**
   * Search Astana Hub Central staff by name, role, or email
   */
  public searchStaff(query: string): StaffMember[] {
    const q = query.toLowerCase();
    return this.staffData.astana_hub_central.team.filter((staff) => 
      staff.name.toLowerCase().includes(q) ||
      staff.position.toLowerCase().includes(q) ||
      staff.email.toLowerCase().includes(q)
    );
  }

  /**
   * Search Regional Hubs or their directors
   */
  public searchHubs(query: string): RegionalHub[] {
    const q = query.toLowerCase();
    return this.staffData.regional_hubs_and_partners.filter((hub) => 
      hub.hub_name.toLowerCase().includes(q) ||
      (hub.leader && hub.leader.name.toLowerCase().includes(q)) ||
      (hub.leader && hub.leader.position.toLowerCase().includes(q))
    );
  }

  /**
   * Search Instagram announcements based on caption keywords
   */
  public searchPosts(query: string, limit: number = 5): InstagramPost[] {
    const q = query.toLowerCase();
    return this.postsData
      .filter((post) => post.caption && post.caption.toLowerCase().includes(q))
      .slice(0, limit);
  }
  
  /**
   * Formats the raw search results into a clean string context for the LLM
   */
  public buildContext(staff: StaffMember[], hubs: RegionalHub[], posts: InstagramPost[]): string {
    let context = '';
    if (staff.length > 0) context += `Staff Info:\n${JSON.stringify(staff, null, 2)}\n\n`;
    if (hubs.length > 0) context += `Regional Hubs Info:\n${JSON.stringify(hubs, null, 2)}\n\n`;
    if (posts.length > 0) context += `Recent Announcements:\n${JSON.stringify(posts, null, 2)}\n\n`;
    
    return context.trim() || 'No relevant data found for the query.';
  }
}