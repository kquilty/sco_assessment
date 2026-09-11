import { IsDateString, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { SessionStatus } from '../generated/prisma/enums';

// NOTE: A few of these were generated from Claude for the sake of time
export class CreateTreatmentSessionDto {

    // NO PLAN ID
    // This will come from the URL

    @IsString()
    @IsNotEmpty()
    session_name: string;

    // ISO 8601 string, e.g. "2026-09-11T14:30:00Z"
    @IsDateString()
    treated_at: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    clinician_id: string;

    @IsEnum(SessionStatus)
    status: SessionStatus;

    // Free-form device settings
    @IsObject()
    parameters: Record<string, unknown>;

    @IsOptional()
    @IsString()
    notes?: string;
}
