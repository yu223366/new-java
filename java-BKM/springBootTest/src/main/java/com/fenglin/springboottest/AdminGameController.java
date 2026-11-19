package com.fenglin.springboottest;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.Announcement;
import com.fenglin.springboottest.entity.Chapter;
import com.fenglin.springboottest.entity.Gym;
import com.fenglin.springboottest.entity.Item;
import com.fenglin.springboottest.entity.Player;
import com.fenglin.springboottest.entity.Region;
import com.fenglin.springboottest.entity.Skill;
import com.fenglin.springboottest.mapper.AnnouncementMapper;
import com.fenglin.springboottest.mapper.ChapterMapper;
import com.fenglin.springboottest.mapper.GymMapper;
import com.fenglin.springboottest.mapper.ItemMapper;
import com.fenglin.springboottest.mapper.PlayerMapper;
import com.fenglin.springboottest.mapper.RegionMapper;
import com.fenglin.springboottest.mapper.SkillMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 后台管理接口：仪表盘、玩家管理（详情/改币/封禁/发放）、公告、市集道具、技能库、道馆、地区、资料库
 */
@RestController
@RequestMapping("/api/admin/game")
public class AdminGameController {

    @Autowired
    private PlayerMapper playerMapper;
    @Autowired
    private AnnouncementMapper announcementMapper;
    @Autowired
    private ItemMapper itemMapper;
    @Autowired
    private SkillMapper skillMapper;
    @Autowired
    private GymMapper gymMapper;
    @Autowired
    private ChapterMapper chapterMapper;
    @Autowired
    private RegionMapper regionMapper;
    @Autowired
    private ObjectMapper objectMapper;

    /** 数据仪表盘 */
    @GetMapping("/stats")
    public Result<Map<String, Object>> stats() {
        Map<String, Object> m = new HashMap<>();
        m.put("players", playerMapper.selectCount(null));
        m.put("announcements", announcementMapper.selectCount(null));
        m.put("items", itemMapper.selectCount(null));
        m.put("skills", skillMapper.selectCount(null));
        m.put("gyms", gymMapper.selectCount(null));
        m.put("chapters", chapterMapper.selectCount(null));
        m.put("legendCaptures", announcementMapper.selectCount(
                new QueryWrapper<Announcement>().eq("type", "legend")));
        m.put("gymAnnouncements", announcementMapper.selectCount(
                new QueryWrapper<Announcement>().eq("type", "gym")));
        return Result.ok(m);
    }

    // ==================== 玩家管理 ====================

    /** 玩家列表 */
    @GetMapping("/players")
    public Result<List<Player>> players() {
        return Result.ok(playerMapper.selectList(
                new QueryWrapper<Player>().orderByDesc("update_time").last("limit 200")));
    }

    /** 玩家详情：精灵 / 背包道具 / 徽章（解析 state_json） */
    @SuppressWarnings("unchecked")
    @GetMapping("/player/{id}/detail")
    public Result<Map<String, Object>> playerDetail(@PathVariable Long id) {
        Player p = playerMapper.selectById(id);
        if (p == null) return Result.fail("玩家不存在");
        Map<String, Object> d = new HashMap<>();
        d.put("id", p.getId());
        d.put("username", p.getUsername());
        d.put("coins", p.getCoins());
        d.put("banned", p.getBanned());
        d.put("starterChosen", p.getStarterChosen());
        d.put("pokemons", new ArrayList<>());
        d.put("bagItems", new HashMap<>());
        d.put("balls", new HashMap<>());
        d.put("badges", new ArrayList<>());
        d.put("potions", 0);
        if (p.getStateJson() != null) {
            try {
                Map<String, Object> st = objectMapper.readValue(p.getStateJson(), Map.class);
                if (st.get("bag") instanceof List) d.put("pokemons", st.get("bag"));
                if (st.get("bagItems") != null) d.put("bagItems", st.get("bagItems"));
                if (st.get("balls") != null) d.put("balls", st.get("balls"));
                d.put("potions", st.getOrDefault("potions", 0));
                // 徽章 id -> 道馆徽章名
                if (st.get("badges") instanceof List) {
                    List<Object> bids = (List<Object>) st.get("badges");
                    List<Map<String, Object>> badges = new ArrayList<>();
                    for (Object b : bids) {
                        try {
                            Long gid = Long.valueOf(String.valueOf(b));
                            Gym g = gymMapper.selectById(gid);
                            Map<String, Object> bm = new HashMap<>();
                            bm.put("gymId", gid);
                            bm.put("badge", g != null ? g.getBadge() : "未知徽章");
                            bm.put("gym", g != null ? g.getName() : "");
                            badges.add(bm);
                        } catch (Exception ignored) {
                        }
                    }
                    d.put("badges", badges);
                }
            } catch (Exception ignored) {
            }
        }
        return Result.ok(d);
    }

    /** 修改玩家金币 */
    @PostMapping("/player/coins")
    public Result<Void> setCoins(@RequestBody Map<String, Object> b) {
        if (b.get("id") == null) return Result.fail("缺少玩家 id");
        Player p = playerMapper.selectById(Long.valueOf(String.valueOf(b.get("id"))));
        if (p == null) return Result.fail("玩家不存在");
        if (b.get("coins") instanceof Number) p.setCoins(((Number) b.get("coins")).intValue());
        playerMapper.updateById(p);
        return Result.ok();
    }

    /** 发放物品：kind = coins | ball | item */
    @SuppressWarnings("unchecked")
    @PostMapping("/player/grant")
    public Result<Void> grant(@RequestBody Map<String, Object> b) {
        if (b.get("id") == null || b.get("kind") == null) return Result.fail("缺少参数");
        Long id = Long.valueOf(String.valueOf(b.get("id")));
        String kind = String.valueOf(b.get("kind"));
        String itemName = b.get("itemName") == null ? "" : String.valueOf(b.get("itemName"));
        int qty = b.get("qty") instanceof Number ? ((Number) b.get("qty")).intValue() : 1;
        Player p = playerMapper.selectById(id);
        if (p == null) return Result.fail("玩家不存在");

        if ("coins".equals(kind)) {
            p.setCoins((p.getCoins() == null ? 0 : p.getCoins()) + qty);
            playerMapper.updateById(p);
            return Result.ok();
        }

        Map<String, Object> st = new HashMap<>();
        if (p.getStateJson() != null) {
            try { st = objectMapper.readValue(p.getStateJson(), Map.class); } catch (Exception ignored) {}
        }
        if ("ball".equals(kind)) {
            Map<String, Object> balls = st.get("balls") instanceof Map ? (Map<String, Object>) st.get("balls") : new HashMap<>();
            int cur = balls.get(itemName) instanceof Number ? ((Number) balls.get(itemName)).intValue() : 0;
            balls.put(itemName, cur + qty);
            st.put("balls", balls);
        } else if ("item".equals(kind)) {
            Map<String, Object> items = st.get("bagItems") instanceof Map ? (Map<String, Object>) st.get("bagItems") : new HashMap<>();
            int cur = items.get(itemName) instanceof Number ? ((Number) items.get(itemName)).intValue() : 0;
            items.put(itemName, cur + qty);
            st.put("bagItems", items);
        } else {
            return Result.fail("未知物品类型");
        }
        try { p.setStateJson(objectMapper.writeValueAsString(st)); } catch (Exception e) {
            return Result.fail("存档序列化失败");
        }
        playerMapper.updateById(p);
        return Result.ok();
    }

    /** 封禁 / 解封 */
    @PostMapping("/player/ban")
    public Result<Void> ban(@RequestBody Map<String, Object> b) {
        if (b.get("id") == null) return Result.fail("缺少玩家 id");
        Player p = playerMapper.selectById(Long.valueOf(String.valueOf(b.get("id"))));
        if (p == null) return Result.fail("玩家不存在");
        p.setBanned(b.get("banned") instanceof Number ? ((Number) b.get("banned")).intValue() : 1);
        playerMapper.updateById(p);
        return Result.ok();
    }

    /** 删除玩家 */
    @DeleteMapping("/player/{id}")
    public Result<Void> deletePlayer(@PathVariable Long id) {
        playerMapper.deleteById(id);
        return Result.ok();
    }

    // ==================== 公告管理 ====================

    @PostMapping("/announcement")
    public Result<Void> publish(@RequestBody Map<String, Object> b) {
        Object co = b.get("content");
        if (co == null) return Result.fail("公告内容不能为空");
        String content = String.valueOf(co);
        if (content.isEmpty() || "null".equals(content)) return Result.fail("公告内容不能为空");
        Announcement a = new Announcement();
        a.setContent(content);
        a.setType(b.get("type") == null ? "system" : String.valueOf(b.get("type")));
        a.setVisible(1);
        announcementMapper.insert(a);
        return Result.ok();
    }

    @PostMapping("/announcement/{id}/visible")
    public Result<Void> toggleVisible(@PathVariable Long id, @RequestBody Map<String, Object> b) {
        Announcement a = announcementMapper.selectById(id);
        if (a == null) return Result.fail("公告不存在");
        a.setVisible(b.get("visible") instanceof Number ? ((Number) b.get("visible")).intValue() : 1);
        announcementMapper.updateById(a);
        return Result.ok();
    }

    @DeleteMapping("/announcement/{id}")
    public Result<Void> deleteAnn(@PathVariable Long id) {
        announcementMapper.deleteById(id);
        return Result.ok();
    }

    @GetMapping("/announcements")
    public Result<List<Announcement>> allAnnouncements() {
        return Result.ok(announcementMapper.selectList(
                new QueryWrapper<Announcement>().orderByDesc("create_time").last("limit 100")));
    }

    // ==================== 市集道具管理 ====================

    @GetMapping("/items")
    public Result<List<Item>> items() {
        return Result.ok(itemMapper.selectList(new QueryWrapper<Item>().orderByAsc("sort")));
    }

    @PostMapping("/item")
    public Result<Void> addItem(@RequestBody Item item) {
        item.setId(null);
        itemMapper.insert(item);
        return Result.ok();
    }

    @PostMapping("/item/update")
    public Result<Void> updateItem(@RequestBody Map<String, Object> b) {
        if (b.get("id") == null) return Result.fail("缺少道具 id");
        Item it = itemMapper.selectById(Long.valueOf(String.valueOf(b.get("id"))));
        if (it == null) return Result.fail("道具不存在");
        if (b.get("name") instanceof CharSequence) it.setName(String.valueOf(b.get("name")));
        if (b.get("category") instanceof CharSequence) it.setCategory(String.valueOf(b.get("category")));
        if (b.get("price") instanceof Number) it.setPrice(((Number) b.get("price")).intValue());
        if (b.get("effect") instanceof CharSequence) it.setEffect(String.valueOf(b.get("effect")));
        if (b.get("enabled") instanceof Number) it.setEnabled(((Number) b.get("enabled")).intValue());
        if (b.get("sort") instanceof Number) it.setSort(((Number) b.get("sort")).intValue());
        itemMapper.updateById(it);
        return Result.ok();
    }

    @DeleteMapping("/item/{id}")
    public Result<Void> deleteItem(@PathVariable Long id) {
        itemMapper.deleteById(id);
        return Result.ok();
    }

    // ==================== 技能库管理 ====================

    @GetMapping("/skills")
    public Result<List<Skill>> skills() {
        return Result.ok(skillMapper.selectList(new QueryWrapper<Skill>().orderByAsc("id")));
    }

    @PostMapping("/skill")
    public Result<Void> addSkill(@RequestBody Skill s) {
        s.setId(null);
        skillMapper.insert(s);
        return Result.ok();
    }

    @PutMapping("/skill")
    public Result<Void> updateSkill(@RequestBody Skill s) {
        skillMapper.updateById(s);
        return Result.ok();
    }

    @DeleteMapping("/skill/{id}")
    public Result<Void> deleteSkill(@PathVariable Long id) {
        skillMapper.deleteById(id);
        return Result.ok();
    }

    // ==================== 道馆管理 ====================

    @GetMapping("/gyms")
    public Result<List<Gym>> gyms() {
        return Result.ok(gymMapper.selectList(new QueryWrapper<Gym>().orderByAsc("id")));
    }

    @PostMapping("/gym")
    public Result<Void> addGym(@RequestBody Gym g) {
        g.setId(null);
        gymMapper.insert(g);
        return Result.ok();
    }

    @PutMapping("/gym")
    public Result<Void> updateGym(@RequestBody Gym g) {
        gymMapper.updateById(g);
        return Result.ok();
    }

    @DeleteMapping("/gym/{id}")
    public Result<Void> deleteGym(@PathVariable Long id) {
        gymMapper.deleteById(id);
        return Result.ok();
    }

    // ==================== 地区管理 ====================

    @GetMapping("/regions")
    public Result<List<Region>> regions() {
        return Result.ok(regionMapper.selectList(new QueryWrapper<Region>().orderByAsc("sort")));
    }

    @PostMapping("/region/update")
    public Result<Void> updateRegion(@RequestBody Map<String, Object> b) {
        if (b.get("id") == null) return Result.fail("缺少地区 id");
        Region r = regionMapper.selectById(Long.valueOf(String.valueOf(b.get("id"))));
        if (r == null) return Result.fail("地区不存在");
        if (b.get("unlocked") instanceof Number) r.setUnlocked(((Number) b.get("unlocked")).intValue());
        if (b.get("requireBadge") instanceof Number) r.setRequireBadge(((Number) b.get("requireBadge")).intValue());
        regionMapper.updateById(r);
        return Result.ok();
    }

    // ==================== 原著资料库管理 ====================

    @GetMapping("/chapters")
    public Result<List<Chapter>> chapters() {
        return Result.ok(chapterMapper.selectList(new QueryWrapper<Chapter>().orderByAsc("sort")));
    }

    @PostMapping("/chapter")
    public Result<Void> addChapter(@RequestBody Chapter c) {
        c.setId(null);
        chapterMapper.insert(c);
        return Result.ok();
    }

    @PutMapping("/chapter")
    public Result<Void> updateChapter(@RequestBody Chapter c) {
        chapterMapper.updateById(c);
        return Result.ok();
    }

    @DeleteMapping("/chapter/{id}")
    public Result<Void> deleteChapter(@PathVariable Long id) {
        chapterMapper.deleteById(id);
        return Result.ok();
    }

    // ==================== 游戏日志（从玩家存档汇总） ====================

    @SuppressWarnings("unchecked")
    @GetMapping("/logs")
    public Result<List<Map<String, Object>>> logs() {
        List<Player> all = playerMapper.selectList(
                new QueryWrapper<Player>().isNotNull("state_json").orderByDesc("update_time").last("limit 100"));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Player p : all) {
            if (p.getStateJson() == null) continue;
            try {
                Map<String, Object> st = objectMapper.readValue(p.getStateJson(), Map.class);
                List<Object> cap = (List<Object>) st.get("captureLog");
                List<Object> bat = (List<Object>) st.get("battleLog");
                int capN = cap == null ? 0 : cap.size();
                int batN = bat == null ? 0 : bat.size();
                Map<String, Object> row = new HashMap<>();
                row.put("username", p.getUsername());
                row.put("coins", p.getCoins());
                row.put("captureCount", capN);
                row.put("battleCount", batN);
                row.put("lastCapture", cap != null && !cap.isEmpty() ? String.valueOf(((Map<String, Object>) cap.get(0)).get("name")) : "");
                row.put("lastBattle", bat != null && !bat.isEmpty() ? String.valueOf(((Map<String, Object>) bat.get(0)).get("opponent")) : "");
                row.put("updateTime", p.getUpdateTime());
                out.add(row);
            } catch (Exception ignored) {
            }
        }
        return Result.ok(out);
    }
}
