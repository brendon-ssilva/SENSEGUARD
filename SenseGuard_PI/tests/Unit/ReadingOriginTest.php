<?php

declare(strict_types=1);

namespace SenseGuard\Tests\Unit;

use SenseGuard\Domain\ManualReadingRule;
use SenseGuard\Domain\ReadingOrigin;
use SenseGuard\Tests\TestCase;

final class ReadingOriginTest extends TestCase
{
    public function testManualReadingIsRecordedOnlyWhenTheValueChanges(): void
    {
        $this->assertTrue(!ManualReadingRule::shouldRecord(null, 0.0), 'novo sensor com o 0 padrão do formulário');
        $this->assertTrue(ManualReadingRule::shouldRecord(null, 12.5));
        $this->assertTrue(!ManualReadingRule::shouldRecord(10.0, 10.0));
        $this->assertTrue(ManualReadingRule::shouldRecord(10.0, 10.5));
        $this->assertTrue(ManualReadingRule::shouldRecord(10.0, 0.0), 'zerar um valor existente é uma leitura');
    }

    public function testReadingOriginValues(): void
    {
        $this->assertSame(['dispositivo', 'importacao', 'manual'], ReadingOrigin::values());
    }
}
