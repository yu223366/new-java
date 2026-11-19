package com.fenglin.springboottest;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.Pokemon;
import com.fenglin.springboottest.service.PokemonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 宝可梦接口：首页展示 + 分级分类搜索 + 后台管理 CRUD
 */
@RestController
@RequestMapping("/api/pokemon")
public class PokemonController {

    @Autowired
    private PokemonService pokemonService;

    /** 搜索/展示：支持 keyword 模糊、category 属性分类、level 稀有度分级 */
    @GetMapping("/search")
    public Result<?> search(@RequestParam(required = false) String keyword,
                            @RequestParam(required = false) String category,
                            @RequestParam(required = false) String level) {
        List<Pokemon> list = pokemonService.search(keyword, category, level);
        return Result.ok(list);
    }

    /** 全部列表(首页默认展示) */
    @GetMapping("/list")
    public Result<?> list() {
        return Result.ok(pokemonService.listAll());
    }

    @GetMapping("/{id}")
    public Result<?> get(@PathVariable Long id) {
        Pokemon p = pokemonService.getById(id);
        return p == null ? Result.fail("宝可梦不存在") : Result.ok(p);
    }

    /** 后台新增 */
    @PostMapping
    public Result<?> add(@RequestBody Pokemon pokemon) {
        pokemon.setId(null);
        return Result.ok(pokemonService.add(pokemon));
    }

    /** 后台修改 */
    @PutMapping
    public Result<?> update(@RequestBody Pokemon pokemon) {
        return Result.ok(pokemonService.update(pokemon));
    }

    /** 后台删除 */
    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        return Result.ok(pokemonService.delete(id));
    }
}
