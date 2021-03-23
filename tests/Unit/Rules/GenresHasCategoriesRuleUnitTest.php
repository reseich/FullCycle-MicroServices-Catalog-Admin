<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class GenresHasCategoriesRuleUnitTest extends TestCase
{

    public function testCategoriesField()
    {
        $rule = new GenresHasCategoriesRule([1, 1, 2, 2]);

        $reflectionClass = new \ReflectionClass(GenresHasCategoriesRule::class);
        $reflectionProperty = $reflectionClass->getProperty('categoriesId');
        $reflectionProperty->setAccessible(true);

        $categoriesId = $reflectionProperty->getValue($rule);
        self::assertEqualsCanonicalizing([1, 2], $categoriesId);
    }

    public function testGenresIdValue()
    {
        $rule = $this->createRuleMock([]);
        $rule->shouldReceive('getRows')->withAnyArgs()->andReturnNull();
        $rule->passes('', [1, 1, 2, 2]);

        $reflectionClass = new \ReflectionClass(GenresHasCategoriesRule::class);
        $reflectionProperty = $reflectionClass->getProperty('genresId');
        $reflectionProperty->setAccessible(true);

        $genresId = $reflectionProperty->getValue($rule);
        self::assertEqualsCanonicalizing([1, 2], $genresId);
    }

    public function testPassesReturnsFalseWhenCategoriesOrGenreArrayIsEmpty()
    {
        $rule = $this->createRuleMock([1]);
        $this->assertFalse($rule->passes('', []));
        $rule = $this->createRuleMock([]);
        $this->assertFalse($rule->passes('', [1]));
    }

    public function testPassesReturnsFalseWhenGetRowIsEmpty()
    {
        $rule = $this->createRuleMock([]);
        $rule->shouldReceive('getRows')->withAnyArgs()->andReturn(collect());
        self::assertFalse($rule->passes('', [1]));
    }

    public function testPassesReturnsFalseWhenHasCategoryWithoutGenres()
    {
        $rule = $this->createRuleMock([1, 2]);
        $rule->shouldReceive('getRows')->withAnyArgs()->andReturn(collect([['category_id' => 1]]));
        self::assertFalse($rule->passes('', [1]));
    }

    public function testPassesIsValid()
    {
        $rule = $this->createRuleMock([1, 2]);
        $rule->shouldReceive('getRows')->withAnyArgs()->andReturn(collect([['category_id' => 1], ['category_id' => 2]]));
        self::assertTrue($rule->passes('', [1]));
    }

    protected function createRuleMock(array $categoriesID)
    {
        return \Mockery::mock(GenresHasCategoriesRule::class, [$categoriesID])->makePartial()->shouldAllowMockingProtectedMethods();
    }

}
